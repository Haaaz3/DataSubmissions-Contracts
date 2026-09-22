declare module "react-simple-maps" {
  import type { ComponentType, CSSProperties, ReactNode, SVGProps } from "react";

  export type GeographyType = {
    rsmKey: string;
    properties?: Record<string, unknown>;
    [key: string]: unknown;
  };

  export const ComposableMap: ComponentType<SVGProps<SVGSVGElement> & Record<string, unknown>>;
  export const Geographies: ComponentType<
    Record<string, unknown> & {
      geography: string | Record<string, unknown>;
      children?: (props: { geographies: GeographyType[] }) => ReactNode;
    }
  >;
  export const Geography: ComponentType<
    Omit<SVGProps<SVGPathElement>, "style"> &
      Record<string, unknown> & {
        geography: GeographyType;
        style?: {
          default?: CSSProperties;
          hover?: CSSProperties;
          pressed?: CSSProperties;
        };
      }
  >;
}
