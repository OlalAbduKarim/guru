export interface AppUser {
  id: string;
  name: string;
  email?: string;
  role?: 'Student' | 'Coach';
  avatarUrl: string;
  country: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  bio?: string;
  followers?: string[];
  following?: string[];
  enrolledCourses?: string[];
}

export interface Coach {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  bio: string;
  country: string;
}

export interface CourseMaterial {
  name: string;
  url: string;
  type: 'pdf' | 'video';
}

export interface Course {
  id: string;
  title: string;
  thumbnailUrl: string;
  coach: Coach;
  rating: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Masterclass';
  price?: number;
  topic: 'Openings' | 'Midgame' | 'Endgame' | 'Strategy';
  description?: string;
  materials?: CourseMaterial[];
  coachId?: string;
}

export interface LiveSession {
  id: string;
  title: string;
  coach: Coach;
  startTime: any; // Can be Date or Firestore Timestamp
  status: 'Live' | 'Upcoming' | 'Past';
  description?: string;
  coachId?: string;
  participants?: string[];
}

export interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: any; // Firestore Timestamp
}

export interface GamePlayer {
    id: string;
    name: string;
    avatarUrl: string;
}

export interface Game {
    id: string;
    pgn: string;
    fen: string;
    whitePlayer: GamePlayer;
    blackPlayer?: GamePlayer;
    status: 'waiting' | 'active' | 'completed' | 'aborted';
    winner?: 'white' | 'black' | 'draw';
    endReason?: string;
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}

export interface BaseStudyPlan {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}