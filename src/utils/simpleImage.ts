/**
 * Build styles
 */
// require('./index.css').toString();

import {
  API,
  BaseTool,
  BlockTool,
  BlockToolConstructorOptions,
  SanitizerConfig,
} from '@editorjs/editorjs'

/**
 * SimpleImage Tool for the Editor.js
 * Works only with pasted image URLs and requires no server-side uploader.
 */
type SimpleImageData = {
  url: string
  caption?: string
}

class SimpleImage implements BlockTool {
  api: API
  blockIndex: number
  CSS: any
  nodes: any

  private _data: SimpleImageData = { url: '', caption: '' }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {BlockToolConstructorOptions<SimpleImageData>} options
   */
  constructor(options: BlockToolConstructorOptions<SimpleImageData>) {
    /**
     * Editor.js API
     */
    this.api = options.api

    /**
     * When block is only constructing,
     * current block points to previous block.
     * So real block index will be +1 after rendering
     * @todo place it at the `rendered` event hook to get real block index without +1;
     * @type {number}
     */
    this.blockIndex = this.api.blocks.getCurrentBlockIndex() + 1

    /**
     * Styles
     */
    this.CSS = {
      baseClass: this.api.styles.block,
      loading: this.api.styles.loader,
      input: this.api.styles.input,

      /**
       * Tool's classes
       */
      wrapper: 'cdx-simple-image',
      imageHolder: 'cdx-simple-image__picture',
      caption: 'cdx-simple-image__caption',
    }

    /**
     * Nodes cache
     */
    this.nodes = {
      wrapper: null,
      imageHolder: null,
      image: null,
      caption: null,
      input: null,
    }

    /**
     * Tool's initial data
     */
    this.data = {
      url: options.data.url || '',
      caption: options.data.caption || '',
    }
  }

  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="20" height="20" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
    }
  }

  /**
   * Read pasted image and convert it to base64
   *
   * @static
   * @param {File} file
   * @returns {Promise<SimpleImageData>}
   */
  onDropHandler(file: File): Promise<string> {
    const reader = new FileReader()

    reader.readAsDataURL(file)

    return new Promise((resolve) => {
      reader.onload = (event) => {
        resolve(event?.target?.result as any)
      }
    })
  }

  /**
   * Creates a Block:
   *  0) Show a button if there is no image
   *  1) Show preloader
   *  2) Start to load an image
   *  3) After loading, append image and caption input
   * @public
   */
  render(): HTMLElement {
    const wrapper = this._make('div', [this.CSS.baseClass, this.CSS.wrapper])
    const input = this._make('input', [], {
      type: 'file',
      accept: 'image/*',
    })
    const loader = this._make('div', this.CSS.loading)
    const imageHolder = this._make('div', this.CSS.imageHolder)
    const image = this._make('img') as HTMLImageElement
    const caption = this._make('div', [this.CSS.input, this.CSS.caption], {
      contentEditable: 'true',
      innerHTML: this.data.caption || '',
    })

    let loadButton = this._make('div', [
      'image-input-wrapper',
    ]) as HTMLDivElement | null

    loadButton?.appendChild(input)

    this.nodes.imageHolder = imageHolder
    this.nodes.wrapper = wrapper
    this.nodes.image = image
    this.nodes.caption = caption
    this.nodes.loader = loader
    this.nodes.loadButton = loadButton
    this.nodes.input = input

    caption.dataset.placeholder = 'Enter a caption'

    image.onload = () => {
      wrapper.classList.remove(this.CSS.loading)
      imageHolder.appendChild(image)
      wrapper.appendChild(imageHolder)
      wrapper.appendChild(caption)
      loader.remove()

      if (loadButton !== null) {
        loadButton.remove()
        loadButton = null
      }

      this.nodes.loader = null
    }

    image.onerror = (e) => {
      // @todo use api.Notifies.show() to show error notification
      console.error('Failed to load an image', e)
    }

    if (this.data.url) {
      wrapper.appendChild(loader)
      image.src = this.data.url
    } else {
      loadButton && wrapper.appendChild(loadButton)

      input.onchange = (e: any) => {
        const file = e.target?.files[0]

        this.onDropHandler(file).then((output) => {
          this.data = {
            url: output,
            caption: file.name,
          }

          loadButton?.remove()
          loadButton = null
        })
      }
    }

    return wrapper
  }

  /**
   * @public
   * Saving method
   * @param {Element} blockContent - Tool's wrapper
   * @return {SimpleImageData}
   */
  save(blockContent: HTMLElement): SimpleImageData {
    const image = blockContent.querySelector('img') as HTMLImageElement,
      caption = blockContent.querySelector(
        '.' + this.CSS.input
      ) as HTMLDivElement

    if (!image) {
      return this.data
    }

    return {
      ...this.data,
      url: image.src,
      caption: caption.innerHTML,
    }
  }

  /**
   * Sanitizer rules
   */
  static get sanitize(): SanitizerConfig {
    return {
      url: {},
      caption: {
        br: true,
      },
    }
  }

  /**
   * On paste callback that is fired from Editor.
   *
   * @param {PasteEvent} event - event with pasted config
   */
  onPaste(event: { type: string; detail: any }): void {
    switch (event.type) {
      case 'tag':
        const img = event.detail.data

        this.data = {
          url: img.src,
        }

        break

      case 'pattern':
        const { data: text } = event.detail
        this.data = {
          url: text,
        }
        break

      case 'file':
        const { file } = event.detail

        this.onDropHandler(file).then((output) => {
          this.data = {
            url: output,
            caption: file.name,
          }
        })
        break
    }

    this.nodes.loadButton.remove()
    this.nodes.loadButton = null
  }

  /**
   * Returns image data
   * @return {SimpleImageData}
   */
  get data(): SimpleImageData {
    return this._data
  }

  /**
   * Set image data and update the view
   *
   * @param {SimpleImageData} data
   */
  set data(data: SimpleImageData) {
    this._data = {
      ...this.data,
      ...data,
    }

    if (this.nodes.image) {
      this.nodes.image.src = this.data.url
    }

    if (this.nodes.caption) {
      this.nodes.caption.innerHTML = this.data.caption
    }
  }

  /**
   * Specify paste substitutes
   * @see {@link ../../../docs/tools.md#paste-handling}
   * @public
   */
  static get pasteConfig() {
    return {
      patterns: {
        image: /https?:\/\/\S+\.(gif|jpe?g|tiff|png)$/i,
      },
      tags: ['img'],
      files: {
        mimeTypes: ['image/*'],
      },
    }
  }

  /**
   * Helper for making Elements with attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {array|string} classNames  - list or name of CSS classname(s)
   * @param  {Object} attributes        - any attributes
   * @return {Element}
   */
  _make(
    tagName: string,
    classNames: string | string[] | null = null,
    attributes: Record<string, string | boolean> = {}
  ): HTMLElement {
    const el = document.createElement(tagName) as any

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames)
    } else if (classNames) {
      el.classList.add(classNames)
    }

    for (const attrName in attributes) {
      el[attrName] = attributes[attrName]
    }

    return el
  }
}

export default SimpleImage

// /**
//  * Build styles
//  */
// // require('./index.css').toString();

// /**
//  * SimpleImage Tool for the Editor.js
//  * Works only with pasted image URLs and requires no server-side uploader.
//  *
//  * @typedef {object} SimpleImageData
//  * @description Tool's input and output data format
//  * @property {string} url — image URL
//  * @property {string} caption — image caption
//  */
// class SimpleImage {
//   /**
//    * Render plugin`s main Element and fill it with saved data
//    *
//    * @param {{data: SimpleImageData, config: object, api: object}}
//    *   data — previously saved data
//    *   config - user config for Tool
//    *   api - Editor.js API
//    */
//   constructor({ data, config, api }) {
//     /**
//      * Editor.js API
//      */
//     this.api = api

//     /**
//      * When block is only constructing,
//      * current block points to previous block.
//      * So real block index will be +1 after rendering
//      * @todo place it at the `rendered` event hook to get real block index without +1;
//      * @type {number}
//      */
//     this.blockIndex = this.api.blocks.getCurrentBlockIndex() + 1

//     /**
//      * Styles
//      */
//     this.CSS = {
//       baseClass: this.api.styles.block,
//       loading: this.api.styles.loader,
//       input: this.api.styles.input,

//       /**
//        * Tool's classes
//        */
//       wrapper: 'cdx-simple-image',
//       imageHolder: 'cdx-simple-image__picture',
//       caption: 'cdx-simple-image__caption',
//     }

//     /**
//      * Nodes cache
//      */
//     this.nodes = {
//       wrapper: null,
//       imageHolder: null,
//       image: null,
//       caption: null,
//       input: null,
//     }

//     /**
//      * Tool's initial data
//      */
//     this.data = {
//       url: data.url || '',
//       caption: data.caption || '',
//     }
//   }

//   static get toolbox() {
//     return {
//       title: 'Image',
//       icon: '<svg width="20" height="20" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
//     }
//   }

//   /**
//    * Read pasted image and convert it to base64
//    *
//    * @static
//    * @param {File} file
//    * @returns {Promise<SimpleImageData>}
//    */
//   onDropHandler(file) {
//     const reader = new FileReader()

//     reader.readAsDataURL(file)

//     return new Promise((resolve) => {
//       reader.onload = (event) => {
//         resolve(event.target.result)
//       }
//     })
//   }

//   /**
//    * Creates a Block:
//    *  0) Show a button if there is no image
//    *  1) Show preloader
//    *  2) Start to load an image
//    *  3) After loading, append image and caption input
//    * @public
//    */
//   render() {
//     let wrapper = this._make('div', [this.CSS.baseClass, this.CSS.wrapper]),
//       loadButton = this._make('div', ['image-input-wrapper']),
//       input = this._make('input', [], {
//         type: 'file',
//         accept: 'image/*',
//       }),
//       loader = this._make('div', this.CSS.loading),
//       imageHolder = this._make('div', this.CSS.imageHolder),
//       image = this._make('img'),
//       caption = this._make('div', [this.CSS.input, this.CSS.caption], {
//         contentEditable: 'true',
//         innerHTML: this.data.caption || '',
//       })

//     loadButton.appendChild(input)

//     this.nodes.imageHolder = imageHolder
//     this.nodes.wrapper = wrapper
//     this.nodes.image = image
//     this.nodes.caption = caption
//     this.nodes.loader = loader
//     this.nodes.loadButton = loadButton
//     this.nodes.input = input

//     caption.dataset.placeholder = 'Enter a caption'

//     image.onload = () => {
//       wrapper.classList.remove(this.CSS.loading)
//       imageHolder.appendChild(image)
//       wrapper.appendChild(imageHolder)
//       wrapper.appendChild(caption)
//       loader.remove()

//       if (loadButton !== null) {
//         loadButton.remove()
//         loadButton = null
//       }

//       this.nodes.loader = null
//       this._acceptTuneView()
//     }

//     image.onerror = (e) => {
//       // @todo use api.Notifies.show() to show error notification
//       console.log('Failed to load an image', e)
//     }

//     if (this.data.url) {
//       wrapper.appendChild(loader)
//       image.src = this.data.url
//     } else {
//       wrapper.appendChild(loadButton)

//       input.onchange = (e) => {
//         const file = e.target.files[0]

//         this.onDropHandler(file).then((output: any) => {
//           this.data = {
//             url: output,
//             caption: file.name,
//           }

//           loadButton.remove()
//           loadButton = null
//         })
//       }
//     }

//     return wrapper
//   }

//   /**
//    * @public
//    * Saving method
//    * @param {Element} blockContent - Tool's wrapper
//    * @return {SimpleImageData}
//    */
//   save(blockContent) {
//     let image = blockContent.querySelector('img'),
//       caption = blockContent.querySelector('.' + this.CSS.input)

//     if (!image) {
//       return this.data
//     }

//     return Object.assign(this.data, {
//       url: image.src,
//       caption: caption.innerHTML,
//     })
//   }

//   /**
//    * Sanitizer rules
//    */
//   static get sanitize() {
//     return {
//       url: {},
//       caption: {
//         br: true,
//       },
//     }
//   }

//   /**
//    * On paste callback that is fired from Editor.
//    *
//    * @param {PasteEvent} event - event with pasted config
//    */
//   onPaste(event) {
//     switch (event.type) {
//       case 'tag':
//         const img = event.detail.data

//         this.data = {
//           url: img.src,
//         }

//         break

//       case 'pattern':
//         const { data: text } = event.detail

//         this.data = {
//           url: text,
//         }
//         break

//       case 'file':
//         const { file } = event.detail

//         this.onDropHandler(file).then((output: any) => {
//           this.data = {
//             url: output,
//             caption: file.name,
//           }
//         })
//         break
//     }

//     this.nodes.loadButton.remove()
//     this.nodes.loadButton = null
//   }

//   /**
//    * Returns image data
//    * @return {SimpleImageData}
//    */
//   get data() {
//     return this._data
//   }

//   /**
//    * Set image data and update the view
//    *
//    * @param {SimpleImageData} data
//    */
//   set data(data) {
//     this._data = Object.assign({}, this.data, data)

//     if (this.nodes.image) {
//       this.nodes.image.src = this.data.url
//     }

//     if (this.nodes.caption) {
//       this.nodes.caption.innerHTML = this.data.caption
//     }
//   }

//   /**
//    * Specify paste substitutes
//    * @see {@link ../../../docs/tools.md#paste-handling}
//    * @public
//    */
//   static get pasteConfig() {
//     return {
//       patterns: {
//         image: /https?:\/\/\S+\.(gif|jpe?g|tiff|png)$/i,
//       },
//       tags: ['img'],
//       files: {
//         mimeTypes: ['image/*'],
//       },
//     }
//   }

//   /**
//    * Helper for making Elements with attributes
//    *
//    * @param  {string} tagName           - new Element tag name
//    * @param  {array|string} classNames  - list or name of CSS classname(s)
//    * @param  {Object} attributes        - any attributes
//    * @return {Element}
//    */
//   _make(tagName, classNames = null, attributes = {}) {
//     let el = document.createElement(tagName)

//     if (Array.isArray(classNames)) {
//       el.classList.add(...classNames)
//     } else if (classNames) {
//       el.classList.add(classNames)
//     }

//     for (let attrName in attributes) {
//       el[attrName] = attributes[attrName]
//     }

//     return el
//   }
// }

// export default SimpleImage
