import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { jobs } from "@/data/dashboardMock";
import { cn } from "@/lib/utils";

const priorityStyle = {
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Low: "bg-muted text-muted-foreground border-border",
};

const statusStyle = {
  Open: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  "On hold": "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Closed: "bg-muted text-muted-foreground border-border",
};

const JobsCard = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              My jobs
            </CardTitle>
            <CardDescription>Active requisitions assigned to you</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/create-job">
              New job <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.map((job) => {
          const fillPct = (job.filled / job.positions) * 100;
          return (
            <div
              key={job.id}
              className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold truncate">{job.title}</h4>
                    <Badge variant="outline" className={cn("text-[10px]", statusStyle[job.status])}>
                      {job.status}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px]", priorityStyle[job.priority])}>
                      {job.priority}
                    </Badge>
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
              <Progress value={fillPct} className="mt-3 h-1.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default JobsCard;
