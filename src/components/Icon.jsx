import React from 'react';
import {
  Sparkles,
  Target,
  LayoutGrid,
  Clock,
  Circle,
  Settings2,
  X,
  Trash2,
  Plus,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  CalendarDays,
  Watch,
  Zap,
  Edit3,
  CheckCircle2,
  Anchor,
  Wind,
  BookOpen,
  Coffee,
  Tag,
  Briefcase,
  BarChart2,
  Square,
  Link,
  Hourglass,
  Sun,
} from 'lucide-react';

const iconMap = {
  sparkles: Sparkles,
  target: Target,
  sun: Sun,
  hourglass: Hourglass,
  'layout-grid': LayoutGrid,
  clock: Clock,
  circle: Circle,
  'settings-2': Settings2,
  x: X,
  'trash-2': Trash2,
  plus: Plus,
  'maximize-2': Maximize2,
  pause: Pause,
  play: Play,
  'rotate-ccw': RotateCcw,
  'calendar-days': CalendarDays,
  watch: Watch,
  zap: Zap,
  'edit-3': Edit3,
  'check-circle-2': CheckCircle2,
  anchor: Anchor,
  wind: Wind,
  'book-open': BookOpen,
  coffee: Coffee,
  tag: Tag,
  briefcase: Briefcase,
  'bar-chart-2': BarChart2,
  square: Square,
  link: Link,
};

const Icon = ({ name, size = 16, className = '', ...rest }) => {
  const Component = iconMap[name];
  if (!Component) return null;
  return <Component size={size} className={className} {...rest} />;
};

export default Icon;

