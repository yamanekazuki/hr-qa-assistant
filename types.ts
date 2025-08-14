export interface QAItem {
  id: string;
  category: string;
  subCategory?: string;
  question: string;
  answer: string;
  keywords: string[];
}
