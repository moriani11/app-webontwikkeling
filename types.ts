import { ObjectId } from "mongodb";

export interface Team {
  _id: ObjectId;
  name: string;
  country: string;
  league: string;
  stadium: string;
  logoUrl: string;
}

export interface Player {
  id: string;
  name: string;
  description: string;
  age: number;
  isActive: boolean;
  birthDate: string;
  imageUrl: string;
  position: string;
  hobbies: string[];
  teamId: string;
  team: Team;
}

export interface User {
    username: string;
    password?: string;
    role: "ADMIN" | "USER";
}

export interface FlashMessage {
    type: "error" | "success";
    message: string;
}