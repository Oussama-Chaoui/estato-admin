export interface DashboardStatistics {
  totalProperties: number;
  totalUsers: number;
  totalAgents: number;
  totalInquiries: number;
  totalAppointments: number;
  totalRentals: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  occupancyRate: number;
  propertyUtilizationRate: number;
  agentActivityRate: number;
  propertyUtilizationBreakdown: {
    availableProperties: number;
    daysInMonth: number;
    totalAvailableDays: number;
    actualRentedDays: number;
    utilizationRate: number;
    lastMonthUtilizationRate: number;
    currentDate: string;
    monthStart: string;
    rentalCount: number;
  };
  clientGrowthBreakdown: {
    currentMonthClients: number;
    lastMonthClients: number;
    clientsGrowth: number;
    totalClients: number;
    currentMonthStart: string;
    currentMonthEnd: string;
    lastMonthStart: string;
    lastMonthEnd: string;
  };
  agentActivityBreakdown: {
    currentMonthActivityRate: number;
    lastMonthActivityRate: number;
    activityGrowth: number;
    activeAgentsThisMonth: number;
    activeAgentsLastMonth: number;
    totalAgents: number;
    currentMonthStart: string;
    currentMonthEnd: string;
    lastMonthStart: string;
    lastMonthEnd: string;
  };
  averageRentalPrice: number;
  revenueKpiProgress: number;
  // Property Portfolio Health
  forSaleProperties: number;
  forRentProperties: number;
  soldProperties: number;
  rentedProperties: number;
  featuredProperties: number;
  vrProperties: number;
  // Agent Applications
  totalAgentApplications: number;
  pendingAgentApplications: number;
  approvedAgentApplications: number;
  rejectedAgentApplications: number;
  // Blog Content
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  // Property Features
  totalBedrooms: number;
  totalBathrooms: number;
  totalArea: number;
  // New Growth percentages
  featuredPropertiesGrowth: number;
  vrPropertiesGrowth: number;
  publishedPostsGrowth: number;
  agentApplicationsGrowth: number;
  // Growth percentages
  propertiesGrowth: number;
  usersGrowth: number;
  agentsGrowth: number;
  agentActivityGrowth: number;
  clientsGrowth: number;
  inquiriesGrowth: number;
  appointmentsGrowth: number;
  rentalsGrowth: number;
}

export interface MonthlyTrend {
  month: string;
  properties: number;
  rentals: number;
  revenue: number;
  salesRevenue: number;
  rentalRevenue: number;
  inquiries: number;
}

export interface TopAgent {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  agencyName: string;
  rentalsCount: number;
  rentals: Array<{
    id: number;
    price: string;
    startDate: string;
    endDate: string;
  }>;
}

export interface TopLocation {
  location_id: number;
  count: number;
  location: {
    id: number;
    city: {
      id: number;
      names: {
        en?: string;
        fr: string;
        es?: string;
        ar: string;
      };
    };
  };
}

export interface RecentInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
  property: {
    id: number;
    title: {
      fr: string;
      en?: string;
      es?: string;
      ar: string;
    };
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RecentAppointment {
  id: number;
  scheduled_at: string;
  status: string;
  notes?: string;
  client_name: string;
  property: {
    id: number;
    title: {
      fr: string;
      en?: string;
      es?: string;
      ar: string;
    };
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  agent: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export interface RecentRental {
  id: number;
  startDate: string;
  endDate: string;
  price: string;
  createdAt: string;
  updatedAt: string;
  propertyId: number;
  clientId: number;
  agentId: number;
  property: {
    id: number;
    title: {
      en: string;
      fr: string;
      es: string;
      ar: string;
    };
    dailyPrice?: string;
    monthlyPrice?: string;
  };
  renter?: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
  agent: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export interface RecentAgentApplication {
  id: number;
  name: string;
  email?: string;
  phone: string;
  status: string;
  created_at: string;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  propertyStatusStats: Record<string, { count: number }>;
  propertyTypeStats: Array<{ type: string; count: number }>;
  inquiryStatusStats: Record<string, { count: number }>;
  appointmentStatusStats: Record<string, { count: number }>;
  monthlyTrends: MonthlyTrend[];
  topAgents: TopAgent[];
  topLocations: TopLocation[];
  recentInquiries: RecentInquiry[];
  recentAppointments: RecentAppointment[];
  recentRentals: RecentRental[];
  recentAgentApplications: RecentAgentApplication[];
}

export enum INQUIRY_STATUS {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED',
}

export enum APPOINTMENT_STATUS {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RESCHEDULED = 'RESCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELED = 'CANCELED',
  DECLINED = 'DECLINED',
}

export enum AGENT_APPLICATION_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
