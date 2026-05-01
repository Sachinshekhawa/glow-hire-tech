import { useState, MouseEvent } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { DATE_RANGE_OPTIONS, useDateRange } from "@/lib/dateRange";

const DateRangeFilter = () => {
  const { range, setRange, label } = useDateRange();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  const onOpen = (e: MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget);
  const onClose = () => setAnchor(null);

  return (
    <>
      <Button
        onClick={onOpen}
        variant="outlined"
        size="small"
        startIcon={<Calendar className="h-4 w-4" />}
        endIcon={<ChevronDown className="h-4 w-4" />}
        sx={{
          borderColor: "hsl(var(--border))",
          color: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--card) / 0.6)",
          textTransform: "none",
          fontWeight: 500,
        }}
      >
        {label}
      </Button>
      <Menu anchorEl={anchor} open={open} onClose={onClose} slotProps={{ paper: { sx: { minWidth: 200 } } }}>
        {DATE_RANGE_OPTIONS.map((opt) => {
          const active = opt.value === range;
          return (
            <MenuItem
              key={opt.value}
              selected={active}
              onClick={() => {
                setRange(opt.value);
                onClose();
              }}
            >
              <ListItemText>{opt.label}</ListItemText>
              {active && <Check className="h-4 w-4 text-primary ml-2" />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default DateRangeFilter;
