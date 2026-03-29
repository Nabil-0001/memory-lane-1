export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  images: string[];
  tags?: string[];
}

export interface MilestoneFormData {
  title: string;
  date: string;
  description: string;
  images: string[];
  tags?: string[];
}
