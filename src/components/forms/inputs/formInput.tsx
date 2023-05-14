import { StyledFormInput } from '@styled/form'
import Icon from '@svgs/Icon'
import { IconTypes } from '@typings/icontypes'
import React, { Fragment, ReactNode } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import styled from 'styled-components'

export const FormInput = (
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: IconTypes | ReactNode
    name: string
    small?: boolean
  }
) => {
  const { name, className, small, icon, ...rest } = props
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]?.message as string
  return (
    <Fragment>
      <div className={className}>
        <StyledFormInput className={`form-input ${error ? 'has_error' : ''}`}>
          {icon && (
            <span className="form-icon">
              {typeof icon === 'string' ? (
                <Icon type={icon as IconTypes} />
              ) : (
                icon
              )}
            </span>
          )}
          <input
            style={{
              height: small ? '32px' : undefined,
              paddingLeft: !icon ? '0.5em' : undefined,
            }}
            {...register(name)}
            {...rest}
          />
        </StyledFormInput>
        {error && <p className="error-message">{error}</p>}
      </div>
    </Fragment>
  )
}

// export const FormInputWithSubmit = ({
//   name,
//   className,
//   small,
//   icon,
//   onClick,
//   arrayField,
// }: {
//   name: string
//   small?: boolean
//   icon?: IconTypes
//   className?: string
//   onClick?: (name: string) => void
//   arrayField?: boolean
// }) => {
//   const {
//     control,
//     formState: { errors },
//   } = useFormContext()

//   const {
//     field: { onChange, onBlur, value, ref },
//   } = useController({ name, control })

//   const handleKeyDown = (e: any) => {
//     if (e.key === 'enter') {
//       e.preventDefault()
//       onBlur()
//     }
//   }

//   let arrayFieldName = undefined
//   if (arrayField) {
//     const splitted = name.split('.')
//     if (splitted.length !== 3) throw Error('Invalid Id')
//     arrayFieldName = splitted[0] + '[' + splitted[1] + '].' + splitted[2]
//   }

//   const error = errors[!arrayField || !arrayFieldName ? name : arrayFieldName]
//     ?.message as string

//   return (
//     <Wrapper className={className}>
//       <div className="wrapper">
//         <div className={`input-wrapper ${error ? 'has_error' : ''}`}>
//           <input
//             className={`form-input`}
//             onChange={onChange}
//             onBlur={onBlur}
//             value={value}
//             style={small ? { height: '32px' } : {}}
//             ref={ref}
//             onKeyDown={handleKeyDown}
//           />
//         </div>
//         <div
//           className="input-submit"
//           onClick={() => (onClick ? onClick(name) : onBlur())}
//         >
//           <Icon type={icon || 'arrow-circle'} />
//         </div>
//       </div>
//       {error && <p className="error-message">{error}</p>}
//     </Wrapper>
//   )
// }

const Wrapper = styled.div`
  .wrapper {
    display: flex;
    border: 1.5px solid ${({ theme }) => theme.shades.dark[100]};
    border-radius: 6px;
    width: 100%;
  }

  .input-wrapper {
    width: 100%;
    input {
      border: none;
    }
  }

  .input-submit {
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
      svg {
        fill: ${({ theme }) => theme.colors.primary};
      }
    }
  }
`
