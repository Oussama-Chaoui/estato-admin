import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
  alpha,
  Paper,
  Tooltip,
  Stack,
} from '@mui/material';
import { ChevronLeft, ChevronRight, CheckCircle, Info } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';
import { Property, RENTAL_TYPE } from '@modules/properties/defs/types';
import { Rental } from '@modules/rentals/hooks/api/useRentals';
import { useTranslation } from 'react-i18next';

interface AvailabilityDatePickerProps {
  property: Property;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onDateRangeSelect: (startDate: Dayjs | null, endDate?: Dayjs | null) => void;
  minDate?: Dayjs;
  label: string;
  rentType: RENTAL_TYPE;
  editingRental?: Rental | null;
  viewMode?: boolean;
  onMonthChange?: (month: Dayjs) => void;
}

const AvailabilityDatePicker: React.FC<AvailabilityDatePickerProps> = ({
  property,
  startDate,
  endDate,
  onDateRangeSelect,
  minDate,
  label,
  rentType,
  editingRental,
  viewMode = false,
  onMonthChange,
}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation(['property', 'common']);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [_selectingEnd, setSelectingEnd] = useState(false);

  dayjs.locale(i18n.language);

  useEffect(() => {
    setCurrentMonth((prevMonth) => {
      const year = prevMonth.year();
      const month = prevMonth.month();
      return dayjs().year(year).month(month);
    });
  }, [i18n.language]);

  const bookings: Rental[] = property.rentals || [];

  const isDateBooked = (date: Dayjs) => {
    const checkDate = date.startOf('day');

    return bookings.some((booking) => {
      if (editingRental && booking.id === editingRental.id) {
        return false;
      }

      const bookingStart = dayjs(booking.startDate).startOf('day');
      const bookingEnd = dayjs(booking.endDate).startOf('day');

      return (
        checkDate.isSame(bookingStart) ||
        (checkDate.isAfter(bookingStart) && checkDate.isBefore(bookingEnd))
      );
    });
  };

  const isDateInEditingRange = (date: Dayjs) => {
    if (!editingRental) {
      return false;
    }

    const checkDate = date.startOf('day');
    const editingStart = dayjs(editingRental.startDate).startOf('day');
    const editingEnd = dayjs(editingRental.endDate).startOf('day');

    return (
      checkDate.isSame(editingStart) ||
      (checkDate.isAfter(editingStart) && checkDate.isBefore(editingEnd))
    );
  };

  const isDateAvailable = (date: Dayjs) => {
    const today = dayjs().startOf('day');
    const checkDate = date.startOf('day');

    if (checkDate.isBefore(today)) {
      return false;
    }

    if (minDate && checkDate.isBefore(minDate.startOf('day'))) {
      return false;
    }

    if (startDate && rentType === RENTAL_TYPE.DAILY) {
      const start = startDate.startOf('day');
      const end = checkDate.startOf('day');

      if (end.isBefore(start)) {
        return false;
      }

      let currentDate = start.add(1, 'day');
      while (currentDate.isBefore(end)) {
        if (isDateBooked(currentDate)) {
          return false;
        }
        currentDate = currentDate.add(1, 'day');
      }
    } else if (isDateBooked(date)) {
      return false;
    }

    return true;
  };

  const isDateInRange = (date: Dayjs) => {
    if (!startDate || !endDate) {
      return false;
    }
    const checkDate = date.startOf('day');
    return (
      checkDate.isAfter(startDate.startOf('day')) && checkDate.isBefore(endDate.startOf('day'))
    );
  };

  const getDayStyle = (date: Dayjs) => {
    const isStartSelected = startDate && date.isSame(startDate, 'day');
    const isEndSelected = endDate && date.isSame(endDate, 'day');
    const isInRange = isDateInRange(date);
    const isAvailable = isDateAvailable(date);
    const isToday = date.isSame(dayjs(), 'day');
    const isCurrentMonth = date.month() === currentMonth.month();
    const isBooked = isDateBooked(date);
    const isInEditingRange = isDateInEditingRange(date);

    let backgroundColor = 'transparent';
    let color = theme.palette.text.primary;
    let border = '1px solid transparent';
    let borderRadius: number | string = 1;

    if (!isCurrentMonth) {
      color = theme.palette.text.disabled;
    } else if (isStartSelected || isEndSelected) {
      backgroundColor = theme.palette.primary.main;
      color = theme.palette.primary.contrastText;
      border = `2px solid ${theme.palette.primary.main}`;
      if (isStartSelected && !isEndSelected) {
        borderRadius = '8px 4px 4px 8px';
      } else if (isEndSelected && !isStartSelected) {
        borderRadius = '4px 8px 8px 4px';
      }
    } else if (isInRange) {
      backgroundColor = alpha(theme.palette.primary.main, 0.15);
      color = theme.palette.primary.dark;
      border = `1px solid ${alpha(theme.palette.primary.main, 0.3)}`;
      borderRadius = 4;
    } else if (isInEditingRange) {
      backgroundColor = alpha(theme.palette.warning.main, 0.15);
      color = theme.palette.warning.dark;
      border = `1px solid ${alpha(theme.palette.warning.main, 0.4)}`;
    } else if (isAvailable) {
      backgroundColor = alpha(theme.palette.success.main, 0.1);
      color = theme.palette.success.dark;
      border = `1px solid ${alpha(theme.palette.success.main, 0.3)}`;
    } else if (isBooked) {
      backgroundColor = alpha(theme.palette.error.main, 0.1);
      color = theme.palette.error.main;
      border = `1px solid ${alpha(theme.palette.error.main, 0.3)}`;
    } else {
      backgroundColor = alpha(theme.palette.grey[400], 0.1);
      color = theme.palette.text.disabled;
    }

    if (isToday && !isStartSelected && !isEndSelected) {
      border = `2px solid ${theme.palette.warning.main}`;
    }

    // Determine cursor style
    let cursor = 'default';
    if (!viewMode) {
      if (isAvailable || isInEditingRange) {
        cursor = 'pointer';
      } else {
        cursor = 'not-allowed';
      }
    }

    // Determine hover backgroundColor
    const getHoverBackgroundColor = () => {
      if (viewMode || (!isAvailable && !isInEditingRange)) {
        return {};
      }
      if (isStartSelected || isEndSelected) {
        return {
          backgroundColor: theme.palette.primary.dark,
          transform: 'scale(1.05)',
        };
      }
      if (isInEditingRange) {
        return {
          backgroundColor: alpha(theme.palette.warning.main, 0.25),
          transform: 'scale(1.05)',
        };
      }
      return {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        transform: 'scale(1.05)',
      };
    };

    return {
      backgroundColor,
      color,
      border,
      borderRadius,
      cursor,
      minHeight: 36,
      minWidth: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: isStartSelected || isEndSelected || isToday ? 600 : 400,
      fontSize: isStartSelected || isEndSelected ? '0.9rem' : '0.8rem',
      transition: 'all 0.2s ease',
      position: 'relative',
      '&:hover': getHoverBackgroundColor(),
    };
  };

  const getTooltipContent = (date: Dayjs) => {
    const isAvailable = isDateAvailable(date);
    const isBooked = isDateBooked(date);
    const isPast = date.isBefore(dayjs(), 'day');
    const isStartSelected = startDate && date.isSame(startDate, 'day');
    const isEndSelected = endDate && date.isSame(endDate, 'day');
    const isInEditingRange = isDateInEditingRange(date);

    if (viewMode) {
      if (isBooked) {
        const rental = bookings.find((booking) => {
          const bookingStart = dayjs(booking.startDate).startOf('day');
          const bookingEndDate = booking.endDate.toString().split('T')[0];
          const bookingEnd = dayjs(bookingEndDate).startOf('day');
          const checkDate = date.startOf('day');
          return (
            checkDate.isSame(bookingStart) ||
            (checkDate.isAfter(bookingStart) && checkDate.isBefore(bookingEnd))
          );
        });
        return rental
          ? `${rental.renter?.user?.name || t('property:booking_calendar.date_picker.unknown')}`
          : t('property:booking_calendar.date_picker.booked');
      }
      if (isAvailable) {
        return t('property:booking_calendar.date_picker.available');
      }
      return t('property:booking_calendar.date_picker.not_available');
    }

    if (isStartSelected) {
      return t('property:booking_calendar.date_picker.checkin_date');
    }
    if (isEndSelected) {
      return t('property:booking_calendar.date_picker.checkout_date');
    }
    if (isPast) {
      return t('property:booking_calendar.date_picker.past_date_not_available');
    }
    if (isInEditingRange) {
      return t('property:booking_calendar.date_picker.currently_editing');
    }
    if (isAvailable) {
      if (rentType === RENTAL_TYPE.DAILY && !startDate) {
        return t('property:booking_calendar.date_picker.click_to_select_checkin');
      }
      if (rentType === RENTAL_TYPE.DAILY && startDate && !endDate) {
        return t('property:booking_calendar.date_picker.click_to_select_checkout');
      }
      return t('property:booking_calendar.date_picker.available_for_booking');
    }
    if (isBooked) {
      return t('property:booking_calendar.date_picker.someone_checking_in');
    }
    return t('property:booking_calendar.date_picker.not_available');
  };

  const monthStart = currentMonth.startOf('month');
  const monthEnd = currentMonth.endOf('month');
  const calendarStart = monthStart.startOf('week');
  const calendarEnd = monthEnd.endOf('week');

  const calendarDays: Dayjs[] = [];
  let day = calendarStart;
  while (day.isBefore(calendarEnd) || day.isSame(calendarEnd, 'day')) {
    calendarDays.push(day);
    day = day.add(1, 'day');
  }

  const handleDateClick = (date: Dayjs) => {
    if (viewMode) {
      return;
    }

    if (!isDateAvailable(date)) {
      return;
    }

    if (rentType === RENTAL_TYPE.DAILY) {
      if (!startDate) {
        onDateRangeSelect(date);
        setSelectingEnd(true);
      } else if (date.isSame(startDate)) {
        onDateRangeSelect(null, null);
        setSelectingEnd(false);
      } else if (date.isSame(endDate)) {
        onDateRangeSelect(startDate, null);
        setSelectingEnd(true);
      } else if (date.isBefore(startDate)) {
        onDateRangeSelect(date);
        setSelectingEnd(true);
      } else {
        onDateRangeSelect(startDate, date);
        setSelectingEnd(false);
      }
    } else if (startDate && date.isSame(startDate)) {
      onDateRangeSelect(null, null);
    } else {
      onDateRangeSelect(date);
    }
  };

  const goToPrevMonth = () => {
    const newMonth = currentMonth.subtract(1, 'month');
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = currentMonth.add(1, 'month');
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const goToToday = () => {
    const newMonth = dayjs();
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" onClick={goToPrevMonth}>
            <ChevronLeft />
          </IconButton>

          <Button
            variant="text"
            onClick={goToToday}
            sx={{
              minWidth: 140,
              fontWeight: 600,
            }}
          >
            {currentMonth.format('MMMM YYYY')}
          </Button>

          <IconButton size="small" onClick={goToNextMonth}>
            <ChevronRight />
          </IconButton>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} mb={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: alpha(theme.palette.success.main, 0.2),
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            }}
          />
          <Typography variant="caption">
            {t('property:booking_calendar.date_picker.available')}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: alpha(theme.palette.error.main, 0.2),
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          />
          <Typography variant="caption">
            {t('property:booking_calendar.date_picker.booked')}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: theme.palette.primary.main,
            }}
          />
          <Typography variant="caption">
            {t('property:booking_calendar.date_picker.selected')}
          </Typography>
        </Stack>
        {rentType === RENTAL_TYPE.DAILY && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: 0.5,
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            />
            <Typography variant="caption">
              {t('property:booking_calendar.date_picker.in_range')}
            </Typography>
          </Stack>
        )}
        {editingRental && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: 0.5,
                bgcolor: alpha(theme.palette.warning.main, 0.15),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.4)}`,
              }}
            />
            <Typography variant="caption">
              {t('property:booking_calendar.date_picker.currently_editing_legend')}
            </Typography>
          </Stack>
        )}
      </Stack>

      <Box
        sx={{
          mb: 2,
          p: 1.5,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Info fontSize="small" />
          <strong>{t('property:booking_calendar.date_picker.checkin_time_note')}</strong>{' '}
          {t('property:booking_calendar.date_picker.checkin_time')} |{' '}
          <strong>{t('property:booking_calendar.date_picker.checkout_time_note')}</strong>{' '}
          {t('property:booking_calendar.date_picker.checkout_time')}.
          {t('property:booking_calendar.date_picker.checkin_checkout_description')}
        </Typography>
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={0.5} mb={1}>
        {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(
          (dayKey) => (
            <Typography
              key={dayKey}
              variant="caption"
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                color: theme.palette.text.secondary,
                py: 0.5,
              }}
            >
              {t(`common:days.${dayKey}`)}
            </Typography>
          )
        )}
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={0.5}>
        {calendarDays.map((date) => {
          const dayStyle = getDayStyle(date);
          return (
            <Tooltip key={date.toString()} title={getTooltipContent(date)} arrow>
              <Box onClick={() => handleDateClick(date)} sx={dayStyle}>
                {date.format('D')}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {!viewMode && (startDate || endDate) && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <Stack spacing={1}>
            {startDate && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircle fontSize="small" sx={{ color: theme.palette.primary.main }} />
                <Typography variant="body2" fontWeight={600}>
                  {rentType === RENTAL_TYPE.DAILY
                    ? t('property:booking_calendar.date_picker.checkin')
                    : t('property:booking_calendar.date_picker.start')}
                  : {startDate.format('dddd, MMMM D, YYYY')}
                </Typography>
              </Stack>
            )}
            {endDate && rentType === RENTAL_TYPE.DAILY && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircle fontSize="small" sx={{ color: theme.palette.primary.main }} />
                <Typography variant="body2" fontWeight={600}>
                  {t('property:booking_calendar.date_picker.checkout')}:{' '}
                  {endDate.format('dddd, MMMM D, YYYY')}
                </Typography>
              </Stack>
            )}
            {rentType === RENTAL_TYPE.DAILY && startDate && !endDate && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {t('property:booking_calendar.date_picker.now_select_checkout')}
              </Typography>
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default AvailabilityDatePicker;
