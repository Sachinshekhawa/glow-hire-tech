import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { interviews, type InterviewStatus } from "@/data/dashboardMock";
import { Video, MapPin, Phone } from "lucide-react";

const statusStyle: Record<InterviewStatus, string> = {
  Scheduled: "bg-primary/15 text-primary border-primary/30",
  "In progress": "bg-accent/15 text-accent border-accent/30",
  Completed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  "No-show": "bg-destructive/15 text-destructive border-destructive/30",
  Rescheduled: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

const modeIcon = {
  Virtual: Video,
  Onsite: MapPin,
  Phone: Phone,
};

const formatWhen = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const InterviewsTable = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-lg">Interviews</CardTitle>
            <CardDescription>Upcoming and recent rounds</CardDescription>
          </div>
          <Button variant="ghost" size="sm">View all</Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead className="hidden md:table-cell">Role · Client</TableHead>
              <TableHead>When</TableHead>
              <TableHead className="hidden sm:table-cell">Round</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((iv) => {
              const ModeIcon = modeIcon[iv.mode];
              return (
                <TableRow key={iv.id}>
                  <TableCell>
                    <div className="font-medium">{iv.candidate}</div>
                    <div className="text-xs text-muted-foreground md:hidden">
                      {iv.role}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">{iv.role}</div>
                    <div className="text-xs text-muted-foreground">{iv.client}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <ModeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatWhen(iv.when)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {iv.round}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyle[iv.status]}>
                      {iv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InterviewsTable;
