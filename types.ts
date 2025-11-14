export interface Lesson {
  id: string;
  title: string;
  url: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
}

export interface Module {
  id: string;
  title: string;
  lessons?: Lesson[];
}

export interface Advertisement {
  id: string;
  imageUrl: string;
  affiliateUrl: string;
  altText: string;
}

export interface Course {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  modules?: Module[];
  subCourses?: Course[];
  resources?: Resource[];
  advertisement?: Advertisement;
}
