export interface UserResponse {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export interface SafeToSpendResponse {
  amount: number;
  currency: string;
  remaining_days: number;
  remaining_budget: number;
  upcoming_costs: number;
}

export interface CategoryResponse {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  is_savings_goal: boolean;
  monthly_target: number | null;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  icon?: string | null;
  is_savings_goal?: boolean;
  monthly_target?: number | null;
}

export interface BudgetRuleResponse {
  id: string;
  user_id: string;
  label: string;
  percentage: number;
  monthly_income: number | null;
  currency: string;
  created_at: string;
}

export interface BudgetRuleCreate {
  label: string;
  percentage: number;
  monthly_income?: number | null;
  currency?: string;
}

export interface BudgetRuleUpdate {
  label?: string;
  percentage?: number;
  monthly_income?: number | null;
  currency?: string;
}

export interface TransactionResponse {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  description: string | null;
  category_id: string | null;
  transaction_date: string;
  created_at: string;
}

export interface TransactionCreate {
  amount: number;
  currency?: string;
  description?: string | null;
  category_id?: string | null;
  transaction_date?: string | null;
}

export interface PaginatedTransactions {
  items: TransactionResponse[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface AlertResponse {
  id: string;
  user_id: string;
  category_id: string | null;
  alert_type: 'BREACH_PREDICTED' | 'PACE_ELEVATED' | 'EVENT_REMINDER';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface EventResponse {
  id: string;
  user_id: string;
  name: string;
  estimated_cost: number;
  event_date: string;
  category_id: string | null;
  created_at: string;
}

export interface EventCreate {
  name: string;
  estimated_cost: number;
  event_date: string;
  category_id?: string | null;
}

export interface GoalProgress {
  category_id: string;
  category_name: string;
  monthly_target: number;
  contributed: number;
  progress_percentage: number;
}

export interface GoalProgressList {
  goals: GoalProgress[];
}

export type Tone = 'brand' | 'safe' | 'warn' | 'danger' | 'neutral';

/** Rule + its matching category merged for display */
export interface EnrichedRule extends BudgetRuleResponse {
  category: CategoryResponse | null;
}
