export type DeleteTarget = {
  id: string;
  kind: "active" | "draft";
  label: string;
  name: string;
  chapterCount: number;
  hasPendingChapter: boolean;
};
