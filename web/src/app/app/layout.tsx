import { DeskShell } from "@/components/desk/shell";

export default function DeskLayout({ children }: LayoutProps<"/app">) {
  return <DeskShell>{children}</DeskShell>;
}
