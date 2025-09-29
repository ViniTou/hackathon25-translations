php bin/console app:generate-translations-diff 84 5 fre-FR 5 eng-GB

Arguments by order:
 - contentId: 84
 - VersionNo A: 5
 - Language A: fre-FR
 - VersionNo B: 5
 - Language B: eng-GB


REST ENDPOINT

GET https://50.ddev.site/api/translations/diff/84/5/fre-FR/5/eng-GB
Accept: application/json


```json
{
  "diff": [
    {
      "issues": [
        {
          "id": "text",
          "type": "inconsistency",
          "field": "text",
          "severity": "high",
          "title": "French version is not translated",
          "description": "The fre-FR content remains in English (\"Simple Rich Text in French\") instead of being translated into French, causing a language mismatch with the locale.",
          "suggestion": "\u003C?xml version=\"1.0\" encoding=\"UTF-8\"?\u003E\n\u003Csection xmlns=\"http://docbook.org/ns/docbook\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:ezxhtml=\"http://ibexa.co/xmlns/dxp/docbook/xhtml\" xmlns:ezcustom=\"http://ibexa.co/xmlns/dxp/docbook/custom\" version=\"5.0-variant ezpublish-1.0\"\u003E\u003Cpara\u003ETexte enrichi simple en français\u003C/para\u003E\u003C/section\u003E\n",
          "impact": "Users of the French locale will see English text, reducing trust and clarity and potentially affecting UX and SEO."
        }
      ]
    }
  ],
  "content_id": 88,
  "version_a": {
    "number": 2,
    "language": "fre-FR"
  },
  "version_b": {
    "number": 2,
    "language": "eng-GB"
  }
}
```
