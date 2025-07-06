import { Card } from "@/components/ui/card";
import { Note } from "../types/note";
import dayjs from "dayjs";

const NoteCard = (note: Note) => {
  return (
    <Card className="border rounded-lg shadow-md p-4">
      <div className="flex flex-col items-start">
        <p className="text-lg">{note.message}</p>
        <p className="text-sm mt-2 text-muted-foreground">
          {note.timestamp
            ? dayjs(note.timestamp).format("MMMM D, YYYY h:mm A")
            : "No timestamp available"}
        </p>
      </div>
    </Card>
  );
};

export default NoteCard;
