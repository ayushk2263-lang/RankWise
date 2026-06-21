export type TabType = 
  | 'predictor' 
  | 'marks-vs-rank'
  | 'analytics' 
  | 'colleges' 
  | 'compare' 
  | 'advisor' 
  | 'dashboard' 
  | 'architecture';

export interface UserSession {
  email: string;
  name: string;
  rank: number;
  category: 'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS';
  gender: 'Gender-Neutral' | 'Female-Only';
  homeState: string;
  examType: 'JEE-Main' | 'JEE-Advanced';
  shortlist: string[]; // "collegeId:branchCode"
  emailAlertsEnabled?: boolean;
  alertOnCutoffChange?: boolean;
  alertOnPlacementUpdate?: boolean;
  alertFrequency?: 'immediate' | 'daily' | 'weekly';
}

export type ExamType = 'JEE-Main' | 'JEE-Advanced';
export type CategoryType = 'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS';
export type GenderType = 'Gender-Neutral' | 'Female-Only';

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry", "Chandigarh"
];

export const CATEGORIES: CategoryType[] = ['OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS'];
