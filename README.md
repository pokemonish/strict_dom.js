# strict_dom.js
Removing desired tags and attributes from your site (watch example [here](https://wasiher.github.io/strict_dom/)) using [MutationObserver](https://developer.mozilla.org/docs/Web/API/MutationObserver)

## Usage:
Here are 3 examples of strict_dom configuration:

**using emembed manifest:** putting manifest in script tag as JSON
```html
<script src="strict_dom.js">
{
    "tagsType": "blacklist",
    "tags": [
        "script"
    ],
    "attributesType": "blacklist",
    "attributes": {
        "*": ["onerror"]
    }
}
</script>
```
**emembed manifest by id:** putting manifest in any tag by given id as JSON
```html
<noscript id="some_id">
{
    "tagsType": "blacklist",
    "tags": [
        "script"
    ],
    "attributesType": "blacklist",
    "attributes": {
        "*": ["onerror"]
    }
}
</noscript>
<script src="strict_dom.js" manifest="some_id"></script>
```
**setting global manifest:** saving manifest value in __window.strictDomManifest__ variable
```html
<script>
window.strictDomManifest = {
    "tagsType": "blacklist",
    "tags": [
        "script"
    ],
    "attributesType": "blacklist",
    "attributes": {
        "*": ["onerror"]
    }
}
</script>
<script src="strict_dom.js"></script>
```
## Important: manifest must be declared before script import 

## Manifest structure:
* *outdatedUrl (String):* URL which will be navigated if browser doesn't suppot MutationObserver (default: no URL)
* *tagsType (String):* "blacklist" (remove tags mentioned in tags) or "whitelist" (remove all tags except mentioned in tags)
* *tags (Array of strings):* names of tags
* *attributesType (String):* "blacklist" (remove tags mentioned in attributes) or "whitelist" (remove all tags except mentioned in attributes)
* *attributes (Object of Arrays of Strings):* name of attributes (star means any tag)
