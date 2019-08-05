'use strict';

/**
 * @typedef {object} JTD
 * @property {JTD_Element} JTD_Element
 * @property {JTD_Element_Group} JTD_Element_Group
 * @property {JTD_Document} JTD_Document
 */

/**
 * {JTD_Element, JTD_Element_Group, JTD_Document} = json_to_dom
 * @namespace json_to_dom
 * @returns {JTD}
 */
const json_to_dom = (() => {
  const defaultJTD_Element = {
    name: "",
    classes: [],
    id: false,
    domType: "div"
  };
  
  // JTD_Element protected methods
  const checkOptions = Symbol("checkOptions");
  const getType = Symbol("getType");
  const getRandomID = Symbol("getRandomID");
  const combineClasses = Symbol("combineClasses");
  const makeDOMElement = Symbol("makeDOMElement");

  // JTD_Element protected properties
  const validOptionsTypes = Symbol("validOptionsTypes");
  const props = Symbol("props");
  const DOMElement = Symbol("DOMElement");
  const ID = Symbol("ID");

  /**
   * Creates a JTD Element
   * @class
   * @memberof json_to_dom
   * @returns {JTD_Element}
   */
  class JTD_Element {
    /**
     * @param {object} [options]
     * @param {string} [options.name=""] Prepends the random generated IDs with this value.
     * @param {string[]} [options.classes=[]] CSS classes to be added to the element.
     * @param {boolean|string} [options.id=false] If set to `true`: will generate a random ID for the element with `options.name` as a prefix. If value is a `string`: will generate a random ID with set value as a postfix and `options.name` as a prefix.
     * @param {string} [options.domType=div] Sets a DOM element type to be created.
     */
    constructor(options) {
      this[validOptionsTypes] = {
        "name": "string",
        "classes": "array",
        "id": ["boolean", "string"],
        "domType": "string",
        "text": "string"
      };
      this[props] = Object.assign({}, defaultJTD_Element, this[checkOptions](options));
      this[ID] = this[getRandomID]();
      this[DOMElement] = this[makeDOMElement]();
    }
  
    /**
     * Gets the created DOM element
     * @readonly
     * @returns {HTMLElement} DOM element generated.
     */
    get domElement() {
      return this[DOMElement];
    }
  
    /**
     * Gets the random generated ID
     * @readonly
     * @returns {string} Random ID string.
     */
    get id() {
      return this[ID];
    }

    // Protected methods:
  
    /**
     * @private
     * @param {object} obj
     * @returns {string} A string representation of the Object type.
     */
    [getType] (obj) {
      return Object.prototype.toString.call(obj).split(' ')[1].slice(0,-1).toLowerCase();
    }
  
    /**
     * @private
     * @param {*} options
     * @throws Will throw an error if value passed is not an Object.
     * @returns {object} Returns an unchanged options Object.
     */
    [checkOptions] (options) {
      if (this[getType](options) !== "object") {
        throw new Error(`Options is not an Object: options= ${options}`);
      }
  
      for (let option in options) {
        if (Object.prototype.hasOwnProperty.call(options, option) && (option in this[validOptionsTypes])) {
  
          if (this[getType](this[validOptionsTypes][option]) === "array") {
            const validOption = this[validOptionsTypes][option].filter(optionType => {
              return this[getType](options[option]) === optionType;
            }).join('');
  
            if (validOption === '') throw new Error(`Option ${option} is of invalid type`);
          }
  
          else if (this[getType](this[validOptionsTypes][option]) === "string") {
            if ((this[getType](options[option]) !== this[validOptionsTypes][option])) {
              throw new Error(`Option ${option} is of invalid type`);
            }
          }
        }
      }
  
      return options;
    }
  
    /**
     * Gets a random(ish) string.
     * @private
     * @returns {string} A random string;
     */
    [getRandomID]() {
      //from https://codewithmark.com/easily-generate-random-alphanumeric-string-in-javascript
      return Math.random().toString(36).replace('0.', '');
    }
  
    /**
     * Combines classes arrays
     * @private
     * @param  {sting[]} classes An array of classes to be added to the element.
     * @returns {string[]} An array of classes.
     */
    [combineClasses](...classes) {
      return classes.join(' ').replace(/[,]/g," ").trim();
    }
  
    /**
     * Create a DOM element
     * @private
     * @returns {HTMLElement} A generated DOM element.
     */
    [makeDOMElement]() {
      // create a DOM element
      const element = document.createElement(this[props].domType);
      element.textContent = this[props].text;
  
      // set id property
      switch(this[getType](this[props].id)) {
        case "boolean":
          if (this[props].id) {
            element.id = `${this[props].name !== "" ? this[props].name + "-" : ""}${this[ID]}`;
          }
          break;
  
        case "string":
          element.id = `${this[props].name !== "" ? this[props].name + "-" : ""}${this[ID]}-${this[props].id}`;
          break;
  
        default:
          throw new Error("options.id is not type of 'string' nor 'boolean'");
      }
  
      // set classes
      if (this[props].classes.length > 0) element.className = this[combineClasses](this[props].classes);
  
      return element;
    }
  }

  
  
  // JTD_Element_Group protected properties
  const groupElements = Symbol("groupElements");

  // JTD_Element_Group protected methods
  const validateElements = Symbol("validateElements");

  /**
   * Creates a JTD Element Group
   * @class
   * @extends JTD_Element
   * @returns {JTD_Element_Group}
   */
  class JTD_Element_Group extends JTD_Element {
    /**
     * @param {Object} options 
     * @param {JTD_Element[]} [elements]
     */
    constructor(options, elements) {
      super(options);
      this[groupElements] = [];
      this.children = this[validateElements](elements);
    }
  
    /**
     * @type {JTD_Element[]} Array of group children
     * @returns {JTD_Element[]} Array of group children
     */
    set children(elements) {
      // remove duplicates
      elements = [...new Set(elements)];
  
      // filter out elements already included
      if (this[groupElements].length > 0) {
        elements = elements.filter(element => !this[groupElements].includes(element))
      }
  
      this[groupElements] = this[groupElements].concat(this[validateElements](elements));
      elements.forEach(element => this[DOMElement].appendChild(element.domElement));
    }
  
    get children() {
      return this[groupElements];
    }
  
    /**
     * Get child of the group by ID.
     * @param {string} childID An ID of the child.
     * @returns {JTD_Element|null} An instance of the JTD_Element if found OR `null` otherwise.
     */
    getChildById(childID) {
      return this[groupElements].filter(element => element.id === childID)[0] || null;
    }
  
    /**
     * Removes a child from the group
     * @param {(JTD_Element|JTD_Element[])} children An instance or an `Array` of instances of `JTD_Element` to remove.
     * @returns {JTD_Element_Group} An instance of the `JTD_Element_Group` for chaining.
     */
    removeChildren(children) {
      if (this[groupElements].length > 0) {
        this[validateElements](children).forEach(child => {
          child.domElement.remove();
          this[groupElements] = this[groupElements].filter(element => element.id !== child.id);
        });
      }
      return this;
    }
  
    /**
     * @private
     * @param {JTD_Element|JTD_Element[]} elements 
     * @returns {JTD_Element[]}
     */
    [validateElements] (elements) {
      if (this[getType](elements) !== "array") elements = [elements];
      elements.forEach(element => {
        if (!(element instanceof JTD_Element)) throw new Error(`${element} is not instance of JTD_Element`);
      });
      return elements;
    }
  }
  


  // JTD_Document protected methods
  const validateData = Symbol("validateData");
  const makeDocument = Symbol("makeDocument");

  // JTD_Document protected properties
  const DATA = Symbol("DATA");
  const documentData = Symbol("documentData");

  /**
   * Creates a JTD Document
   * @class
   * @returns {JTD_Document}
   */
  class JTD_Document {
    /**
     * @param {object} JSON_DATA JSON data to be converted to HTML
     */
    constructor(JSON_DATA) {
      this[DATA] = this[validateData](JSON_DATA);
      this[documentData] = this[makeDocument](this[DATA])[0];
    }
  
    /**
     * Gets the generated DOM Element
     * @type {HTMLElement}
     * @readonly
     */
    get DOMElement () {
      return this[documentData].domElement;
    }
  
    [makeDocument](JSON_DATA) {
      const document =  JSON_DATA.reduce((acc, cur) => {
        switch (cur.type) {
          case "group":
            acc.push(new JTD_Element_Group({
              "name": cur.name || "",
              "classes": cur.classes || [],
              "id": cur.id || false,
              "domType": cur.domType || "div",
            }, this[makeDocument](cur.children)));
            return acc;
          
          case "child":
            acc.push(new JTD_Element({
              "name": cur.name || "",
              "classes": cur.classes || [],
              "id": cur.id || false,
              "domType": cur.domType || "div",
              "text": cur.text || ""
            }));
            return acc;
          
          default:
            throw new Error (`Unrecognized type: ${cur.type}`);
        }
      }, []);
  
      return document;
    }
  
    [getType] (obj) {
      return Object.prototype.toString.call(obj).split(' ')[1].slice(0,-1).toLowerCase();
    }
  
    [validateData](JSON_DATA) {
      if (this[getType](JSON_DATA) !== "array") JSON_DATA = [JSON_DATA];
      JSON_DATA.forEach(data => {
        if (data.type !== "group") throw new Error(`Wrong format of JSON data received: Top Object should have type set to "group"`);
      });
      return JSON_DATA;
    }
  }

  return {JTD_Document, JTD_Element, JTD_Element_Group};
})();