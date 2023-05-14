import React, { memo, useEffect, useRef } from 'react'
import EditorJS, { API, OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import CheckList from '@editorjs/checklist'
import Embed from '@editorjs/embed'
import Table from '@editorjs/table'
import styled from 'styled-components'
import Marker from '@editorjs/marker'
import Underline from '@editorjs/underline'
import CodeTool from '@editorjs/code'
import DragDrop from 'editorjs-drag-drop'
import Undo from 'editorjs-undo'
import InlineCode from '@editorjs/inline-code'
import Paragraph from '@editorjs/paragraph'
// import SimpleImage from 'simple-image-editorjs'

import { idGenerate } from '@utils/idGenerate'
import SimpleImage from '@utils/simpleImage'

const BlockEditor = memo(
  ({
    initialData,
    style,
    className,
    onBlur,
    onChange,
  }: {
    onBlur?: (data: OutputData) => void
    onChange?: (api: API, event: CustomEvent<any>) => void
    initialData?: OutputData
    style?: React.CSSProperties
    className?: string
  }) => {
    const editorContainerID = idGenerate('editor')
    const editorCore = useRef<EditorJS | null>(null)

    const handleSave = async () => {
      if (!editorCore.current) return
      const data = await editorCore.current.save()
      onBlur && onBlur(data)
    }

    const handleReady = React.useCallback(
      (editor: EditorJS | null) => {
        if (!editor) return
        editor.isReady
          .then(() => {
            const undo = new Undo({ editor })
            initialData && undo.initialize(initialData)
            new DragDrop(editor)
          })
          .catch((err) => console.warn(`Editor not ready`))
      },
      [editorCore]
    )

    let editor: EditorJS | null
    const initEditor = () => {
      if (editor) return
      editor = new EditorJS({
        holder: editorContainerID,
        logLevel: 'ERROR' as any,
        data: initialData || undefined,
        placeholder: 'Click here to write something...',
        onReady: () => {
          if (!editor) return
          editorCore.current = editor

          handleReady(editor)
        },
        onChange,
        inlineToolbar: true,
        autofocus: false,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: { defaultLevel: 2 },
          },
          list: { class: List, inlineToolbar: true },
          checkList: { class: CheckList, inlineToolbar: true },
          embed: {
            class: Embed,
            inlineToolbar: true,
          },
          underline: Underline,
          image: SimpleImage,

          code: CodeTool,
          Marker: {
            class: Marker,
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          table: { class: Table, inlineToolbar: true },
          inlineCode: {
            class: InlineCode,
          },
        },
      })
    }

    useEffect(() => {
      if (!editorCore.current) {
        initEditor()
      }
      return () => {
        if (editorCore.current) {
          handleSave()
          editorCore.current.destroy()
          editorCore.current = null
        }
      }
    }, [])

    return (
      <Wrapper id={editorContainerID} className={className} style={style} />
    )
  }
)

export default BlockEditor

const Wrapper = styled.div`
  padding: 1em;
  input {
    height: fit-content;
    border: none;
    box-shadow: none;
  }
  .cdx-simple-image .image-input-wrapper {
    height: 40px;
    border: 1.5px solid ${({ theme }) => theme.shades.dark[100]};
    border-radius: 6px;
    &:hover {
      background: ${({ theme }) => theme.shades.dark[50]};
    }
    &:after {
      position: absolute;
      display: block;
      content: 'Choose Image';
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 0;
      left: 0;
      z-index: 0;
    }
    input {
      cursor: pointer;
      opacity: 0;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 1;
    }
  }
  .cdx-simple-image .cdx-loader {
    min-height: 200px;
  }

  .cdx-simple-image .cdx-input {
    margin-top: 10px;
  }

  .cdx-simple-image img {
    max-width: 100%;
    vertical-align: bottom;
  }

  .cdx-simple-image__caption[contentEditable='true'][data-placeholder]:empty::before {
    position: absolute;
    content: attr(data-placeholder);
    color: #707684;
    font-weight: normal;
    opacity: 0;
  }

  .cdx-simple-image__caption[contentEditable='true'][data-placeholder]:empty::before {
    opacity: 1;
  }

  .cdx-simple-image__caption[contentEditable='true'][data-placeholder]:empty:focus::before {
    opacity: 0;
  }

  .cdx-simple-image__picture--with-background {
    background: #eff2f5;
    padding: 10px;
  }

  .cdx-simple-image__picture--with-background img {
    display: block;
    max-width: 60%;
    margin: 0 auto;
  }

  .cdx-simple-image__picture--with-border {
    border: 1px solid #e8e8eb;
    padding: 1px;
  }

  .cdx-simple-image__picture--stretched img {
    max-width: none;
    width: 100%;
  }
  .cdx-search-field {
    align-items: center;
  }
  .ce-block__content,
  .ce-toolbar__content {
    max-width: calc(100% - 100px) !important;
    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */
  }
  .cdx-block {
    max-width: 100% !important;
  }
  .codex-editor__redactor {
    padding-top: 10px;
  }
  .cdx-block .cdx-simple-image {
    background-color: ${({ theme }) => theme.shades.dark[100]};
  }
  .ce-popover__item[data-item-name='image'] .ce-popover__item-icon svg {
    height: 14px;
    width: 14px;
    path {
      font-size: inherit;
    }
  }
  .cdx-settings-button svg {
    stroke-width: 0;
    width: 20px;
    height: 20px;
  }
  @media (max-width: 650px) {
    .cdx-list {
      padding-left: 20px;
    }
    .ce-block__content,
    .ce-toolbar__content {
      max-width: calc(100%) !important;
    }
  }
`
