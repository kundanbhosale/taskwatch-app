import React, { ChangeEvent, Fragment, useEffect, useState } from 'react'
import styled from 'styled-components'
import dayjs, { Dayjs } from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { useController, useFormContext } from 'react-hook-form'
import UseOutsideClick from '@hooks/outsideClick'

const DatePicker = ({ name }: { name: string }) => {
  dayjs.extend(isSameOrBefore)

  const [val, setVal] = useState('')
  const [current, setCurrent] = useState(dayjs())
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const ref = UseOutsideClick(isPopupOpen, () => setIsPopupOpen(false))

  const { control } = useFormContext()
  const {
    field: { onChange, onBlur, value },
  } = useController({
    name,
    control,
  })

  useEffect(() => {
    if (!isPopupOpen) {
      if (value) {
        setVal(dayjs(value).format('DD-MM-YYYY'))
      } else {
        setVal('')
      }
    }
  }, [isPopupOpen, value])

  const setValue = (data: string) => {
    if (data) {
      setVal(data)
      const isValid = dayjs(data).isValid()
      isValid && onChange(dayjs(data).toISOString())
    } else {
      setVal('')
      onChange('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isPopupOpen) {
      setIsPopupOpen(true)
    }

    if (e.key === 'Enter') {
      e.preventDefault()

      setIsPopupOpen(false)
    }
  }

  useEffect(() => {
    value && setVal(dayjs(value).format('DD-MM-YYYY') || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePrevMonth = () => {
    setCurrent((prev) => prev.subtract(1, 'month'))
  }

  const handleNextMonth = () => {
    setCurrent((prev) => prev.add(1, 'month'))
  }

  const handleSelectDay = (day: Dayjs) => {
    setVal(day ? dayjs(day).format('DD-MM-YYYY') : '')
    onChange(day.toISOString())
    onBlur()
    setIsPopupOpen(false)
  }

  const renderWeekdays = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return (
      <DatePickerWeekdays>
        {weekdays.map((weekday) => (
          <div className="week" key={weekday}>
            {weekday}
          </div>
        ))}
      </DatePickerWeekdays>
    )
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const renderDays = () => {
    const firstDayOfMonth = current.startOf('month')
    let endDayOfMonth = current.endOf('month')

    let currentDay = firstDayOfMonth

    const startWeekDay = currentDay.get('day')
    const endWeekDay = endDayOfMonth.get('day')

    if (startWeekDay !== 0) {
      currentDay = currentDay.subtract(startWeekDay, 'day')
    }

    if (endWeekDay !== 6) {
      endDayOfMonth = endDayOfMonth.add(6 - endWeekDay, 'day')
    }

    const days = []

    while (currentDay.isSameOrBefore(endDayOfMonth, 'day')) {
      days.push(currentDay)
      currentDay = currentDay.add(1, 'day')
    }

    return (
      <DaysWrapper>
        {days.map((day) => (
          <DatePickerDay
            key={day.format('DD-MM-YYYY')}
            isSelected={day.isSame(dayjs(value), 'day')}
            isToday={day.isSame(dayjs(), 'day')}
            isMonth={day.isSame(current, 'month')}
            onClick={() => handleSelectDay(day)}
          >
            {day.format('D')}
          </DatePickerDay>
        ))}
      </DaysWrapper>
    )
  }

  return (
    <DatePickerWrapper ref={ref}>
      {isPopupOpen ? (
        <Fragment>
          <DatePickerInput
            value={val}
            onChange={handleChange}
            onFocus={() => setIsPopupOpen(true)}
            onKeyDown={handleKeyDown}
          />
          <DatePickerPopup>
            <DatePickerHeader>
              <DatePickerArrow type="button" onClick={handlePrevMonth}>
                {'<'}
              </DatePickerArrow>
              <DatePickerMonthYear>
                {current.format('MMMM YYYY')}
              </DatePickerMonthYear>
              <DatePickerArrow type="button" onClick={handleNextMonth}>
                {'>'}
              </DatePickerArrow>
            </DatePickerHeader>
            {renderWeekdays()}
            {renderDays()}
          </DatePickerPopup>
        </Fragment>
      ) : (
        <p className="read-only-date" onClick={() => setIsPopupOpen(true)}>
          {(value && dayjs(value).format('DD MMM YYYY')) || '-'}
        </p>
      )}
    </DatePickerWrapper>
  )
}

export default DatePicker

const DatePickerWrapper = styled.div`
  display: inline-block;
  position: relative;
  .read-only-date {
    height: 100%;
    display: flex;
    align-items: center;
    border-radius: 4px;
    padding: 0.5em;
    cursor: pointer;
    &:hover {
      background-color: ${({ theme }) => theme.shades.dark[50]};
    }
  }
`

const DatePickerInput = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border: 1px solid #357edd;
  }
`

const DatePickerPopup = styled.div`
  position: absolute;
  z-index: 10;
  top: 100%;
  right: 0;
  width: 320px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.shades.dark[50]};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0px 2px 8px ${({ theme }) => theme.shades.dark[100]};
`

const DatePickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const DatePickerMonthYear = styled.div`
  font-size: 18px;
  font-weight: bold;
`

const DatePickerArrow = styled.button`
  cursor: pointer;
  font-size: 20px;
  background: none;
  border: none;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const DatePickerWeekdays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  .week {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const DatePickerDay = styled.div<{
  isSelected: boolean
  isToday: boolean
  isMonth: boolean
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.shades.primary[400]};
  }
  ${({ isSelected, isToday, theme, isMonth }) =>
    isSelected
      ? `
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};
  `
      : isToday
      ? `
    background-color: ${theme.shades.primary[200]};
    color: ${theme.colors.primary};
  `
      : !isMonth
      ? `
      color: ${theme.shades.dark[300]};
      `
      : ''}
`

const DaysWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 8px;
`
