const isMatchesByElement = (element, matches) => {
  return matches.some(selector => {
    return element.matches(selector);
  });
};

function getElementInfo(element) {
  const tagName = element.tagName.toLowerCase();
  const isInlineTag = /meta|link/.test(tagName);
  const attributes = Array.from(element.attributes);

  return Object.defineProperties(
    {
      element,
      tagName,
      isInlineTag,
      attributes
    },
    {
      attributeData: {
        get() {
          return attributes.reduce((dest, attribute) => {
            dest.push(`${attribute.name}="${attribute.value}"`);
            return dest;
          }, []);
        }
      }
    }
  );
}

const outerHTML = (element, innerContent = () => "") => {
  const info = getElementInfo(element);
  const { tagName, isInlineTag, attributeData } = info;
  return `<${tagName}${
    attributeData.length ? ` ${attributeData.join(" ")}` : ""
  }${isInlineTag ? " />" : `>${innerContent(info) || ""}</${tagName}>`}`;
};

const fullHTML = element => {
  return outerHTML(element, ({ element }) => element.innerHTML);
};

export const createPrintForm = function(element, document = window.document) {
  function getHTMLText() {
    const heads = [];
    Array.from(document.head.children).forEach(element => {
      if (
        isMatchesByElement(element, ["meta", "link:not([as=script])", "style"])
      ) {
        heads.push(outerHTML(element, ({ element }) => element.innerText));
      }
    });

    const bodyContent = fullHTML(element);

    const printDocument = [
      `<html>`,
      `<head>`,
      ...heads,
      `</head>`,
      `<body>`,
      bodyContent,
      `</body>`,
      `</html>`
    ];
    return printDocument.join("");
  }

  const scope = {};
  let currentFregmentUrl = null;
  let currentIframe = null;

  return Object.defineProperties(scope, {
    html: {
      get() {
        return getHTMLText();
      }
    },
    fregmentUrl: {
      get() {
        if (currentFregmentUrl !== null) {
          return currentFregmentUrl;
        }
        const printContentBlob = new Blob([scope.html], { type: "text/html" });
        const fregmentUrl = URL.createObjectURL(printContentBlob);
        currentFregmentUrl = fregmentUrl;
        return fregmentUrl;
      }
    },
    getFregment: {
      value() {
        return new Promise(resolve => {
          if (currentIframe) {
            if (currentIframe.getAttribute("src") === scope.fregmentUrl) {
              const { contentWindow, contentDocument } = currentIframe;
              return Promise.resolve({
                contentWindow,
                contentDocument
              });
            } else {
              currentIframe.remove();
              currentIframe = null;
            }
          }
          const { fregmentUrl } = scope;
          const iframe = document.createElement("iframe");
          iframe.setAttribute("src", fregmentUrl);
          iframe.setAttribute("style", "display:none");
          currentIframe = iframe;
          document.body.appendChild(iframe);
          iframe.addEventListener("load", () => {
            const { contentWindow, contentDocument } = iframe;
            resolve({
              contentWindow,
              contentDocument
            });
          });
        });
      }
    },
    print: {
      async value() {
        const { contentWindow } = await scope.getFregment();
        contentWindow.print();
      }
    },
    reload: {
      value() {
        if (currentFregmentUrl) {
          URL.revokeObjectURL(currentFregmentUrl);
          currentFregmentUrl = null;
          //this.fregmentUrl
        }
      }
    },
    destroy: {
      value() {
        if (currentFregmentUrl) {
          URL.revokeObjectURL(currentFregmentUrl);
          currentFregmentUrl = null;
        }
      }
    }
  });
};
