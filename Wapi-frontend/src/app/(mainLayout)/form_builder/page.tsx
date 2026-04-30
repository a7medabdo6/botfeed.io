import FormBuilderList from "@/src/components/form-builder/FormBuilderList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Form Builder | Botfeed",
  description: "Create and manage custom forms and Meta Flows",
};

export default function FormBuilderPage() {
  return <FormBuilderList />;
}
