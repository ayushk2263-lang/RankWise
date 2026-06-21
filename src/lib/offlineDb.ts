import { College } from '../data/collegeData';

const DB_NAME = 'RankWiseOfflineDB';
const DB_VERSION = 1;

export interface OfflineStatus {
  initialized: boolean;
  collegesCached: number;
  shortlistCount: number;
  lastUpdated: string | null;
}

export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Graceful fallback for environments without IndexedDB (e.g. some restricted sandboxed frames)
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this client environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB failure:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // College catalog store: Stores individual colleges with 'id' as key
      if (!db.objectStoreNames.contains('colleges')) {
        db.createObjectStore('colleges', { keyPath: 'id' });
      }

      // Shortlisted institutions store: Key-value pair store
      if (!db.objectStoreNames.contains('shortlist')) {
        db.createObjectStore('shortlist', { keyPath: 'id' });
      }

      // Metadata store (e.g. sync timestamps, offline preferences)
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Cache list of colleges to IndexedDB
 */
export async function cacheCollegeCatalog(colleges: College[]): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('colleges', 'readwrite');
      const store = transaction.objectStore('colleges');

      // Clear existing records first to ensure a clean sync
      store.clear();

      colleges.forEach((college) => {
        store.put(college);
      });

      transaction.oncomplete = async () => {
        // Log sync success metadata
        await saveMetadata('last_college_sync', new Date().toISOString());
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (err) {
    console.warn('Fail to cache college catalog to IndexedDB:', err);
  }
}

/**
 * Retrieves all cached colleges from IndexedDB
 */
export async function getCachedColleges(): Promise<College[]> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('colleges', 'readonly');
      const store = transaction.objectStore('colleges');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('Fail to retrieve cached colleges:', err);
    return [];
  }
}

/**
 * Save user shortlisted combinations for offline retrieval
 */
export async function saveOfflineShortlist(shortlist: string[]): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('shortlist', 'readwrite');
      const store = transaction.objectStore('shortlist');

      // Clear existing records
      store.clear();

      // Put latest shortlist code array
      store.put({ id: 'active_shortlist', items: shortlist });

      transaction.oncomplete = async () => {
        await saveMetadata('last_shortlist_sync', new Date().toISOString());
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (err) {
    console.warn('Fail to save shortlist to IndexedDB:', err);
  }
}

/**
 * Retrieve saved shortlist from IndexedDB
 */
export async function getOfflineShortlist(): Promise<string[]> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('shortlist', 'readonly');
      const store = transaction.objectStore('shortlist');
      const request = store.get('active_shortlist');

      request.onsuccess = () => {
        resolve(request.result ? request.result.items : []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('Fail to read shortlist from IndexedDB:', err);
    return [];
  }
}

/**
 * Metadata key value helper
 */
export async function saveMetadata(key: string, value: string): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('metadata', 'readwrite');
      const store = transaction.objectStore('metadata');
      store.put({ key, value });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    // Silently ignore
  }
}

export async function getMetadata(key: string): Promise<string | null> {
  try {
    const db = await initDb();
    return new Promise((resolve) => {
      const transaction = db.transaction('metadata', 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null);
      };
      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    return null;
  }
}

/**
 * Get comprehensive summary of current offline cache state
 */
export async function getOfflineStatus(): Promise<OfflineStatus> {
  try {
    const colleges = await getCachedColleges();
    const shortlist = await getOfflineShortlist();
    const lastSync = await getMetadata('last_college_sync');

    return {
      initialized: true,
      collegesCached: colleges.length,
      shortlistCount: shortlist.length,
      lastUpdated: lastSync
    };
  } catch (err) {
    return {
      initialized: false,
      collegesCached: 0,
      shortlistCount: 0,
      lastUpdated: null
    };
  }
}
