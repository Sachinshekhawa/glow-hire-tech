import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { jobs } from "@/data/dashboardMock";

const priorityChip = {
  High: { bg: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))", border: "hsl(var(--destructive) / 0.3)" },
  Medium: { bg: "hsl(38 92% 50% / 0.15)", color: "hsl(38 92% 55%)", border: "hsl(38 92% 50% / 0.3)" },
  Low: { bg: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "hsl(var(--border))" },
};

const statusChip = {
  Open: { bg: "hsl(160 84% 39% / 0.15)", color: "hsl(160 84% 45%)", border: "hsl(160 84% 39% / 0.3)" },
  "On hold": { bg: "hsl(38 92% 50% / 0.15)", color: "hsl(38 92% 55%)", border: "hsl(38 92% 50% / 0.3)" },
  Closed: { bg: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "hsl(var(--border))" },
};

const JobsCard = () => {
  return (
    <Card>
      <CardHeader
        title={
          <span className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            My jobs
          </span>
        }
        subheader={<span className="text-sm text-muted-foreground">Active requisitions assigned to you</span>}
        action={
          <Button
            component={Link}
            to="/create-job"
            variant="outlined"
            size="small"
            endIcon={<ArrowRight className="h-3 w-3" />}
            sx={{ mr: 2, mt: 1 }}
          >
            New job
          </Button>
        }
      />
      <CardContent className="space-y-3">
        {jobs.map((job) => {
          const fillPct = (job.filled / job.positions) * 100;
          const sStatus = statusChip[job.status];
          const sPrio = priorityChip[job.priority];
          return (
            <div
              key={job.id}
              className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold truncate">{job.title}</h4>
                    <Chip
                      label={job.status}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: 10, backgroundColor: sStatus.bg, color: sStatus.color, borderColor: sStatus.border }}
                    />
                    <Chip
                      label={job.priority}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: 10, backgroundColor: sPrio.bg, color: sPrio.color, borderColor: sPrio.border }}
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{job.client}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span>{job.type}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.ageDays}d open
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    {job.filled}/{job.positions}
                  </div>
                  <div className="text-xs text-muted-foreground">filled</div>
                </div>
              </div>
              <LinearProgress variant="determinate" value={fillPct} sx={{ mt: 1.5, height: 6, borderRadius: 999 }} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default JobsCard;
