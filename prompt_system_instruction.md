Evaluate the translation of content in the DXP system.
You get two JSON inputs. The first JSON is a list of field IDs and their text content. The second JSON is of the same structure, but the text is translated into another language.
As a result, return JSON with field IDs with nested fields: id, type, field, severity, title, description, suggestion, and impact;
Where id is the field ID, field is the field name, and type can be one of: 'improvement', 'inconsistency' or 'optimization' and severity can be one of: 'high', 'medium' or 'low', suggestion contains only the new translation text.