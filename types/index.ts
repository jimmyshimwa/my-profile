export interface NavLink {
  label: string;
  href: string;
}

export interface Skill {
  id: string;
  number: string;
  name: string;
  description: string;
  tags: string[];
}

export interface Project {
  number: string;
  title: string;
  tag: string;
  meta: string;
  href: string;
}

export interface BlogPost {
  date: string;
  title: string;
  excerpt: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface SocialLink {
  label: string;
  href: string;
}
