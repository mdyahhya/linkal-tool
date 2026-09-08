declare module 'lucide-react' {
  import * as React from 'react';
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type Icon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const Globe: Icon;
  export const Lock: Icon;
  export const Mail: Icon;
  export const ShieldCheck: Icon;
  export const Sparkles: Icon;
  export const Plus: Icon;
  export const Search: Icon;
  export const ExternalLink: Icon;
  export const Edit3: Icon;
  export const Rocket: Icon;
  export const Trash2: Icon;
  export const Download: Icon;
  export const Eye: Icon;
  export const CheckCircle2: Icon;
  export const Clock: Icon;
  export const AlertCircle: Icon;
  export const RefreshCw: Icon;
  export const LogOut: Icon;
  export const ShoppingBag: Icon;
  export const User: Icon;
  export const Zap: Icon;
  export const HelpCircle: Icon;
  export const X: Icon;
  export const ChevronRight: Icon;
  export const MessageCircle: Icon;
  export const Save: Icon;
  export const Smartphone: Icon;
  export const Tablet: Icon;
  export const Monitor: Icon;
  export const Check: Icon;
  export const Sliders: Icon;
  export const Image: Icon;
  export const ImageIcon: Icon;
  export const Palette: Icon;
  export const Type: Icon;
  export const Layers: Icon;

  const icons: { [key: string]: Icon };
  export default icons;
}
