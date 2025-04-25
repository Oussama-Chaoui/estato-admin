import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tooltip,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import dayjs from 'dayjs';
import { Rental } from '@modules/properties/defs/types';
import { AccessTime, AssignmentInd, CalendarToday, Person } from '@mui/icons-material';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface BookingCalendarProps {
  bookings: Rental[];
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings }) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentDayjs = dayjs(currentDate);

  const getBookingCoverage = (booking: Rental, date: dayjs.Dayjs) => {
    const dayStart = date.startOf('day');
    const dayEnd = date.endOf('day');
    const bookingStart = dayjs(booking.startDate);
    const bookingEnd = dayjs(booking.endDate);

    const startTime = bookingStart.isBefore(dayStart) ? dayStart : bookingStart;
    const endTime = bookingEnd.isAfter(dayEnd) ? dayEnd : bookingEnd;

    const totalMinutes = 24 * 60;
    const startMinutes = startTime.diff(dayStart, 'minute');
    const endMinutes = endTime.diff(dayStart, 'minute');

    return {
      startPercent: (startMinutes / totalMinutes) * 100,
      endPercent: (endMinutes / totalMinutes) * 100,
    };
  };

  const getCellStyle = (date: dayjs.Dayjs) => {
    const bookingsOnDate = getBookingsForDate(date);
    const isToday = date.isSame(dayjs(), 'day');
    const isWeekend = date.day() === 0 || date.day() === 6;
    const isCurrentMonth = date.month() === currentDayjs.month();

    const gradients = bookingsOnDate.map((booking) => {
      const { startPercent, endPercent } = getBookingCoverage(booking, date);
      const color = alpha(theme.palette.success.light, 0.4);
      return `linear-gradient(to right, 
        transparent ${startPercent}%, 
        ${color} ${startPercent}%, 
        ${color} ${endPercent}%, 
        transparent ${endPercent}%
      )`;
    });

    return {
      backgroundColor: isToday
        ? alpha(theme.palette.primary.lighter, 0.4)
        : isWeekend
          ? alpha(theme.palette.primary.lighter, 0.2)
          : 'transparent',
      border: `1px solid ${theme.palette.divider}`,
      backgroundImage: gradients.join(', '),
      cursor: 'pointer',
      padding: 0,
      height: 72,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      transition: 'all 0.2s ease',
      opacity: isCurrentMonth ? 1 : 0.5,
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: theme.shadows[2],
      },
      ...(bookingsOnDate.length > 0 && {
        borderColor: theme.palette.success.main,
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: theme.palette.success.main,
        },
      }),
    };
  };

  const [monthSelectOpen, setMonthSelectOpen] = useState(false);
  const [yearSelectOpen, setYearSelectOpen] = useState(false);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const currentYearValue = dayjs().year();
  const years: number[] = [];
  for (let y = currentYearValue - 10; y <= currentYearValue + 10; y++) {
    years.push(y);
  }

  const monthStart = currentDayjs.startOf('month');
  const monthEnd = currentDayjs.endOf('month');
  const daysInMonth: dayjs.Dayjs[] = [];
  let dayIterator = monthStart;
  while (dayIterator.isBefore(monthEnd) || dayIterator.isSame(monthEnd, 'day')) {
    daysInMonth.push(dayIterator);
    dayIterator = dayIterator.add(1, 'day');
  }
  const startWeekDay = monthStart.day();
  const paddingDays = Array.from({ length: startWeekDay }, () => null);
  const calendarDays = [...paddingDays, ...daysInMonth];

  const weeksInMonth = Math.ceil((startWeekDay + daysInMonth.length) / 7);
  const totalCells = weeksInMonth * 7;
  const extraPadding = totalCells - calendarDays.length;
  const finalCalendarDays = calendarDays.concat(Array.from({ length: extraPadding }, () => null));

  const getRawFreeSlotsForDay = (date: dayjs.Dayjs, bookingsForDay: Rental[]) => {
    const dayStart = date.startOf('day');
    const minutesInDay = 24 * 60;

    const bookedIntervals = bookingsForDay.map((booking) => {
      const { startPercent, endPercent } = getBookingCoverage(booking, date);
      return {
        start: (startPercent / 100) * minutesInDay,
        end: (endPercent / 100) * minutesInDay,
      };
    });

    bookedIntervals.sort((a, b) => a.start - b.start);

    const freeIntervals: { start: number; end: number }[] = [];
    let lastEnd = 0;
    for (const interval of bookedIntervals) {
      if (interval.start > lastEnd) {
        freeIntervals.push({ start: lastEnd, end: interval.start });
      }
      lastEnd = Math.max(lastEnd, interval.end);
    }
    if (lastEnd < minutesInDay) {
      freeIntervals.push({ start: lastEnd, end: minutesInDay });
    }

    return freeIntervals.map((interval) => ({
      start: dayStart.add(interval.start, 'minute'),
      end: dayStart.add(interval.end, 'minute'),
    }));
  };

  const canAccumulate24HoursFrom = (startMoment: dayjs.Dayjs): boolean => {
    let totalFreeMinutes = 0;
    let currentMoment = startMoment;

    while (true) {
      const currentDay = currentMoment.startOf('day');
      const dayEnd = currentDay.endOf('day');
      const bookingsForDay = getBookingsForDate(currentDay);
      const freeSlots = getRawFreeSlotsForDay(currentDay, bookingsForDay);

      const slot = freeSlots.find(
        (s) => s.start.isSameOrBefore(currentMoment) && s.end.isAfter(currentMoment)
      );

      if (!slot) {
        return false;
      }

      const freeMinutes = slot.end.diff(currentMoment, 'minute');
      totalFreeMinutes += freeMinutes;

      if (totalFreeMinutes >= 24 * 60) {
        return true;
      }

      const minutesToMidnight = dayEnd.diff(slot.end, 'minute');
      if (minutesToMidnight > 1) {
        return false;
      }

      currentMoment = currentDay.add(1, 'day');
    }
  };

  const getAvailableSlots = (date: dayjs.Dayjs, bookingsForDay: Rental[]) => {
    const dayStart = date.startOf('day');
    const now = dayjs();
    const isToday = date.isSame(now, 'day');

    let rawSlots = getRawFreeSlotsForDay(date, bookingsForDay);

    if (isToday) {
      rawSlots = rawSlots
        .map((slot) => {
          if (slot.start.isBefore(now)) {
            return slot.end.isAfter(now) ? { start: now, end: slot.end } : null;
          }
          return slot;
        })
        .filter(Boolean) as { start: dayjs.Dayjs; end: dayjs.Dayjs }[];
    }

    const validSlots = rawSlots.filter((slot) => canAccumulate24HoursFrom(slot.start));

    return validSlots.map((slot) => ({
      start: slot.start.format('HH:mm'),
      end: slot.end.format('HH:mm'),
    }));
  };

  const getBookingsForDate = (date: dayjs.Dayjs): Rental[] => {
    return bookings.filter((booking) => {
      const bookingStart = dayjs(booking.startDate).startOf('day');
      const bookingEnd = dayjs(booking.endDate);

      const dateStart = date.startOf('day');
      const dateEnd = date.endOf('day');

      return bookingStart.isBefore(dateEnd) && bookingEnd.isAfter(dateStart);
    });
  };

  const getTooltipContent = (date: dayjs.Dayjs) => {
    const bookingsOnDate = getBookingsForDate(date);
    const isPastDate = date.isBefore(dayjs(), 'day');
    const availableSlots = getAvailableSlots(date, bookingsOnDate);
    const isFullyBooked = availableSlots.length === 0;
    const isFutureDate = !isPastDate;

    if (bookingsOnDate.length === 0) {
      if (date.isBefore(dayjs(), 'day')) {
        return (
          <Typography variant="caption" color="text.secondary">
            Past date
          </Typography>
        );
      }
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
          <CalendarToday fontSize="small" color="success" />
          <Typography variant="body2" fontWeight={500}>
            Available for booking
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 1.5, maxWidth: 320 }}>
        {isFutureDate && !isFullyBooked && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.success.light, 0.1),
              borderLeft: `3px solid ${theme.palette.success.main}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: theme.palette.success.dark }}
            >
              Partial Availability
            </Typography>
            <Box sx={{ mt: 1 }}>
              {availableSlots.map((slot, index) => (
                <Typography key={index} variant="caption" display="block">
                  Available starting from {slot.start}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {bookingsOnDate.map((booking, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.primary.lighter, 0.1),
              borderLeft: `3px solid ${theme.palette.primary.main}`,
              '&:last-child': { mb: 0 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
                p: 1,
                backgroundColor: alpha(theme.palette.primary.lighter, 0.2),
                borderRadius: 0.5,
              }}
            >
              <CalendarToday fontSize="small" sx={{ color: theme.palette.primary.main }} />
              <Typography variant="subtitle2" fontWeight={600}>
                {dayjs(booking.startDate).format('MMM D')} -{' '}
                {dayjs(booking.endDate).format('MMM D, YYYY')}
              </Typography>
            </Box>

            {dayjs(booking.startDate).isSame(date, 'day') && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                  p: 1,
                  backgroundColor: alpha(theme.palette.success.light, 0.1),
                  borderRadius: 0.5,
                }}
              >
                <AccessTime
                  fontSize="small"
                  sx={{
                    color: theme.palette.success.main,
                    fontSize: '0.9rem',
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <Box component="span" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
                    Started at:
                  </Box>
                  <Box component="span" sx={{ color: theme.palette.success.dark }}>
                    {dayjs(booking.startDate).format('HH:mm')}
                  </Box>
                </Typography>
              </Box>
            )}

            {dayjs(booking.endDate).isSame(date, 'day') && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                  p: 1,
                  backgroundColor: alpha(theme.palette.success.light, 0.1),
                  borderRadius: 0.5,
                }}
              >
                <AccessTime
                  fontSize="small"
                  sx={{
                    color: theme.palette.success.main,
                    fontSize: '0.9rem',
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <Box component="span" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
                    Ends at:
                  </Box>
                  <Box component="span" sx={{ color: theme.palette.success.dark }}>
                    {dayjs(booking.endDate).format('HH:mm')}
                  </Box>
                </Typography>
              </Box>
            )}

            {/* People Section */}
            <Box sx={{ mb: 1.5 }}>
              {booking.renter?.user && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 1,
                    p: 1,
                    borderRadius: 0.5,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.light, 0.1),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 80 }}>
                    <Person fontSize="small" sx={{ color: theme.palette.secondary.main }} />
                    <Typography variant="caption" color="text.secondary">
                      Renter:
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': { color: theme.palette.primary.main },
                    }}
                    onClick={() => console.log('Renter clicked')}
                  >
                    {booking.renter.user.name}
                  </Typography>
                </Box>
              )}

              {booking.agent?.user && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1,
                    borderRadius: 0.5,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.light, 0.1),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 80 }}>
                    <AssignmentInd fontSize="small" sx={{ color: theme.palette.secondary.main }} />
                    <Typography variant="caption" color="text.secondary">
                      Agent:
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': { color: theme.palette.primary.main },
                    }}
                    onClick={() => console.log('Agent clicked')}
                  >
                    {booking.agent.user.name}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                mt: 2,
                pt: 1.5,
                borderTop: `1px dashed ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Rental Info
              </Typography>
              <Typography variant="caption" display="block">
                ID: {booking.id}
              </Typography>
              <Typography variant="caption" display="block">
                Created: {dayjs(booking.createdAt).format('MMM D, YYYY h:mm A')}
              </Typography>
              {booking.updatedAt && (
                <Typography variant="caption" display="block">
                  Updated: {dayjs(booking.updatedAt).format('MMM D, YYYY h:mm A')}
                </Typography>
              )}
              {booking.price !== undefined && (
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ fontWeight: 600, color: theme.palette.success.main }}
                >
                  Price: {booking.price.toLocaleString()} MAD
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const goToNextMonth = () => setCurrentDate(currentDayjs.add(1, 'month').toDate());
  const goToPrevMonth = () => setCurrentDate(currentDayjs.subtract(1, 'month').toDate());

  const isNotToday =
    !currentDayjs.isSame(dayjs(), 'month') || !currentDayjs.isSame(dayjs(), 'year');

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: theme.shadows[1],
      }}
    >
      {/* Calendar Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={goToPrevMonth}
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': { borderColor: 'primary.dark' },
          }}
        >
          Previous
        </Button>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Month Selection */}
          {monthSelectOpen ? (
            <FormControl size="small">
              <InputLabel id="select-month-label">Month</InputLabel>
              <Select
                labelId="select-month-label"
                value={currentDayjs.month()}
                label="Month"
                open
                onClose={() => setMonthSelectOpen(false)}
                onChange={(e) => {
                  const newMonth = e.target.value as number;
                  setCurrentDate(dayjs(currentDate).month(newMonth).date(1).toDate());
                  setMonthSelectOpen(false);
                }}
              >
                {monthNames.map((name, index) => (
                  <MenuItem key={index} value={index}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography
              variant="h6"
              color="text.primary"
              onClick={() => setMonthSelectOpen(true)}
              sx={{ cursor: 'pointer', userSelect: 'none' }}
            >
              {currentDayjs.format('MMMM')}
            </Typography>
          )}

          {/* Year Selection */}
          {yearSelectOpen ? (
            <FormControl size="small">
              <InputLabel id="select-year-label">Year</InputLabel>
              <Select
                labelId="select-year-label"
                value={currentDayjs.year()}
                label="Year"
                open
                onClose={() => setYearSelectOpen(false)}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  setCurrentDate(
                    dayjs(currentDate).year(newYear).month(currentDayjs.month()).date(1).toDate()
                  );
                  setYearSelectOpen(false);
                }}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography
              variant="h6"
              color="text.primary"
              onClick={() => setYearSelectOpen(true)}
              sx={{ cursor: 'pointer', userSelect: 'none' }}
            >
              {currentDayjs.format('YYYY')}
            </Typography>
          )}

          {/* Today Button */}
          {isNotToday ? (
            <Tooltip title="Go to Today">
              <span>
                <IconButton
                  onClick={() => setCurrentDate(new Date())}
                  size="small"
                  sx={{ color: theme.palette.warning.dark }}
                >
                  <RestoreIcon />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <span>
              <IconButton size="small" sx={{ color: theme.palette.warning.dark }} disabled>
                <RestoreIcon />
              </IconButton>
            </span>
          )}
        </Box>

        <Button
          variant="outlined"
          onClick={goToNextMonth}
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': { borderColor: 'primary.dark' },
          }}
        >
          Next
        </Button>
      </Box>

      {/* Day Names */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(7, 1fr)"
        gap={0.5}
        mb={1}
        sx={{
          textAlign: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 1,
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
          <Typography
            key={dayName}
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {dayName}
          </Typography>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(7, 1fr)"
        gap={0.5}
        sx={{
          '& > div': { aspectRatio: '1' },
        }}
      >
        {finalCalendarDays.map((day, index) => {
          if (!day) {
            return (
              <Box
                key={`empty-${index}`}
                sx={{
                  padding: 0,
                  height: 72,
                  width: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.secondary.lighter,
                }}
              />
            );
          }
          const bookingsOnDate = getBookingsForDate(day);
          const isToday = day.isSame(dayjs(), 'day');
          const isWeekend = day.day() === 0 || day.day() === 6;
          return (
            <Tooltip
              key={day.toString()}
              title={getTooltipContent(day)}
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'white',
                    color: 'black',
                    boxShadow: 3,
                    fontSize: '0.8rem',
                    borderRadius: 1,
                    border: '1px solid #ddd',
                    p: 1,
                  },
                },
                arrow: {
                  sx: {
                    color: 'white',
                    '&:before': {
                      border: '1px solid #ddd',
                      transform: 'rotate(45deg)',
                    },
                  },
                },
              }}
            >
              <Box sx={{ ...getCellStyle(day) }}>
                <Typography
                  component="span"
                  sx={{
                    fontWeight: isToday ? 800 : 600,
                    fontSize: isToday ? '1.5rem' : '1.1rem',
                    color: isToday
                      ? theme.palette.success.darker
                      : isWeekend
                        ? theme.palette.secondary.dark
                        : bookingsOnDate.length > 0
                          ? theme.palette.success.dark
                          : theme.palette.text.primary,
                    lineHeight: 1,
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  {day.format('D')}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default BookingCalendar;
