import { ColorSwatch } from '@styled/colorSwatch'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { colord } from 'colord'
import { RgbaStringColorPicker } from 'react-colorful'
import { useController, useFormContext } from 'react-hook-form'
import styled from 'styled-components'
import { StyledFormInput } from '@styled/form'
import UseOutsideClick from '@hooks/outsideClick'
import { Theme } from '@styled/theme'

const ColorPicker = ({
  name,
  position,
  style,
  onChange,
}: {
  name: string
  style?: React.CSSProperties
  onChange?: (color: string) => void

  position?: {
    top?: string | number
    left?: string | number
    right?: string | number
    bottom?: string | number
  }
}) => {
  const { control } = useFormContext()
  const [show, setShow] = useState(false)
  const ref = UseOutsideClick(show, () => setShow(false))
  const colors = ['#acc8bc', '#ffa4a4', '#f5e18d']
  const [val, setVal] = useState('')
  const {
    field: { value, onChange: change },
  } = useController({
    control,
    name,
  })

  const handleChange = (color: string) => {
    change(color)
    setVal(color)
    onChange && onChange(color)
  }

  const rgbaString = useCallback((color: string) => {
    if (!color) return
    let output
    if (color.startsWith('rgba')) {
      output = color
    } else {
      output = colord(val).toRgbString()
    }
    handleChange(output)
  }, [])

  useEffect(() => {
    setVal(value)
    return () => setVal('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Wrapper ref={ref} style={style}>
      {/* <StyledFormInput>
        <span className="form-icon">
          <span
            style={{
              background: value,
              width: 'calc(100% - 10px)',
              height: 'calc(100% - 10px)',
              borderRadius: '4px',
            }}
          />
        </span>
        {(
          <Fragment>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              height={18}
              width={18}
            >
              <path d="M7.78428 14L8.2047 10H4V8H8.41491L8.94043 3H10.9514L10.4259 8H14.4149L14.9404 3H16.9514L16.4259 8H20V10H16.2157L15.7953 14H20V16H15.5851L15.0596 21H13.0486L13.5741 16H9.58509L9.05957 21H7.04855L7.57407 16H4V14H7.78428ZM9.7953 14H13.7843L14.2047 10H10.2157L9.7953 14Z"></path>
            </svg>

            <HexColorInput
              color={value}
              onChange={handleChange}
              //   onFocus={() => setShow(true)}
            />
          </Fragment>
        )}
      </StyledFormInput> */}

      <PopWrapper active={show} style={position && { ...position }}>
        <RgbaStringColorPicker color={value} onChange={handleChange} />
        <input value={val} onChange={(e) => rgbaString(e.target.value)} />
        <Presets>
          {colors.map((c) => (
            <ColorSwatch
              key={c}
              color={c}
              onClick={() => handleChange(c)}
              size="25px"
            />
          ))}
        </Presets>
      </PopWrapper>
      <div
        className="picker-head"
        style={{ background: value }}
        onClick={() => setShow(!show)}
      />
    </Wrapper>
  )
}

export default ColorPicker

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  .picker-head {
    display: block;
    width: 50px;
    height: 30px;
    border: 2px solid ${({ theme }) => theme.shades.dark[200]};
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      border-color: ${({ theme }) => theme.shades.primary[700]};
    }
  }

  /* 
  ${StyledFormInput} {
    position: relative;
  } */
`
const Presets = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 25px);
  gap: 0.5em;
  margin-top: 0.5em;
`
const PopWrapper = styled.div<{ active: boolean }>`
  display: block;
  width: 200px;
  border: 1.5px solid ${({ theme }) => theme.shades.dark[100]};
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 1px 4px 8px 1px ${({ theme }) => theme.shades.dark[100]};
  padding: 0.3em;
  border-radius: 8px;
  position: absolute;
  top: calc(100% + 10px);
  transform: scale(${({ active }) => (active ? 1 : 0)});
  z-index: 20;
  .react-colorful {
    width: auto;
  }

  input {
    padding: 0.5em;
    height: 30px;
    margin-top: 0.5em;
    &::before {
      content: '#';
      display: block;
      height: 10px;
      width: 10px;
    }
  }
`
