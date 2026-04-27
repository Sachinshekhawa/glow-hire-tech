import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { interviews, type InterviewStatus } from "@/data/dashboardMock";
import { Video, MapPin, Phone } from "lucide-react";

const statusSx: Record<InterviewStatus, { bg: string; color: string; border: string }> = {
  Scheduled: { bg: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "hsl(var(--primary) / 0.3)" },
  "In progress": { bg: "hsl(var(--accent) / 0.15)", color: "hsl(var(--accent))", border: "hsl(var(--accent) / 0.3)" },
  Completed: { bg: "hsl(160 84% 39% / 0.15)", color: "hsl(160 84% 45%)", border: "hsl(160 84% 39% / 0.3)" },
  "No-show": { bg: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))", border: "hsl(var(--destructive) / 0.3)" },
  Rescheduled: { bg: "hsl(38 92% 50% / 0.15)", color: "hsl(38 92% 55%)", border: "hsl(38 92% 50% / 0.3)" },
  Cancelled: { bg: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "hsl(var(--border))" },
};

const modeIcon = { Virtual: Video, Onsite: MapPin, Phone: Phone };

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const InterviewsTable = () => {
  return (
    <Card>
      <CardHeader
        title={<span className="text-lg font-semibold tracking-tight">Interviews</span>}
        subheader={<span className="text-sm text-muted-foreground">Upcoming and recent rounds</span>}
        action={
          <Button variant="text" size="small" sx={{ mr: 2, mt: 1 }}>
            View all
          </Button>
        }
      />
      <CardContent sx={{ px: 0 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Candidate</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Role · Client</TableCell>
              <TableCell>When</TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Round</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interviews.map((iv) => {
              const ModeIcon = modeIcon[iv.mode];
              const s = statusSx[iv.status];
              return (
                <TableRow key={iv.id} hover>
                  <TableCell>
                    <div className="font-medium">{iv.candidate}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{iv.role}</div>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <div className="text-sm">{iv.role}</div>
                    <div className="text-xs text-muted-foreground">{iv.client}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <ModeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatWhen(iv.when)}
                    </div>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, color: "text-secondary" }}>
                    <span className="text-sm text-muted-foreground">{iv.round}</span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={iv.status}
                      size="small"
                      variant="outlined"
                      sx={{
                        backgroundColor: s.bg,
                        color: s.color,
                        borderColor: s.border,
                        fontWeight: 500,
                      }}
                    />
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
