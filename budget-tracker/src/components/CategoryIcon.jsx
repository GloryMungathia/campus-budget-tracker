import {
  Utensils, Bus, Home, Smartphone, BookOpen, Music, HeartPulse,
  ShoppingBag, Receipt, GraduationCap, Wallet, Briefcase, PlusCircle,
} from 'lucide-react';

const ICON_MAP = {
  Utensils, Bus, Home, Smartphone, BookOpen, Music, HeartPulse,
  ShoppingBag, Receipt, GraduationCap, Wallet, Briefcase, PlusCircle,
};

export function CategoryIcon({ name, className }) {
  const Icon = ICON_MAP[name] ?? Receipt;
  return <Icon className={className} />;
}
