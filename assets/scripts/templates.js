// @description extract frontmatter from a string
const frontmatter = (content = "", parser = JSON.parse) => {
    const matches = Array.from(content.matchAll(/^(--- *)/gm))
    if (matches?.length === 2 && matches[0].index === 0) {
        return {
            body: content.substring(matches[1].index + matches[1][1].length).trim(),
            attributes: parser(content.substring(matches[0].index + matches[0][1].length, matches[1].index).trim()),
        };
    }
    return { body: content, attributes: {}, };
};

// @description get a template by name
export const loadTemplate = name => {
    return window.fetch(`/templates/${name}.mustache`)
        .then(response => response.text())
        .then(templateContent => frontmatter(templateContent));
};
