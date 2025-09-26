<?php

declare(strict_types=1);

namespace Ibexa\Bundle\HackathonTranslations\AI;

use DOMDocument;
use Ibexa\ConnectorOpenAi\ActionHandler\AbstractActionHandler;
use Ibexa\Contracts\ConnectorAi\Action\DataType\Text;
use Ibexa\Contracts\ConnectorAi\Action\Response\TextResponse;
use Ibexa\Contracts\ConnectorAi\ActionInterface;
use Ibexa\Contracts\ConnectorAi\ActionResponseInterface;
use Ibexa\Contracts\ConnectorAi\ActionType\ActionTypeRegistryInterface;
use Ibexa\Contracts\ConnectorOpenAi\ClientProviderInterface;
use Ibexa\Contracts\Core\Repository\LanguageResolver;
use Ibexa\Contracts\Core\Repository\LanguageService;
use Ibexa\Contracts\Core\Repository\Values\Content\Field;

final class GenerateTranslationsDiffActionHandler extends AbstractActionHandler
{
    public function __construct(
        ClientProviderInterface $clientProvider,
        ActionTypeRegistryInterface $actionTypeRegistry,
        LanguageService $languageService,
        LanguageResolver $languageResolver
    ) {
        parent::__construct($clientProvider, $actionTypeRegistry, $languageService, $languageResolver);
    }

    public function supports(ActionInterface $action): bool
    {
        return $action instanceof GenerateTranslationsDiffAction;
    }

    public function handle(ActionInterface $action, array $context = []): ActionResponseInterface
    {
        $options = $this->resolveOptions($action);

        $json = $this->client->chat([
            'model' => $options['model'],
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $this->getSystemPrompt(),
                ],
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => strtr(
                                'Version A (%languageA%):\n\n%fieldsA%\n\nVersion B (%languageB%):\n\n%fieldsB%\n\n',
                                [
                                    '%languageA%' => $action->getLanguageA(),
                                    '%languageB%' => $action->getLanguageB(),
                                    '%fieldsA%' => json_encode($this->prepareFields($action->getFieldsA()), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                                    '%fieldsB%' => json_encode($this->prepareFields($action->getFieldsB()), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                                ]
                            ),
                        ],
                    ],
                ],
            ],
            'max_completion_tokens' => $options['max_tokens'],
            'temperature' => $options['temperature'],
        ]);

        $this->validateResponse($json);

        $decoded = json_decode($json, true);

        // @todo introduce proper response object
        return new TextResponse(new Text([$json]));
    }

    public static function getIdentifier(): string
    {
        return 'openai-generate-translations-diff';
    }

    public function getSystemPrompt(): string
    {
        return file_get_contents(__DIR__ . '/../../../prompt_system_instruction.md');
    }

    /**
     * @param Field[] $fields
     * @return array<string, string>
     */
    private function prepareFields(array $fields): array
    {
        $result = [];
        foreach ($fields as $field) {
            $value = $field->getValue();
            if ($value instanceof \Ibexa\FieldTypeRichText\FieldType\RichText\Value) {
                $xmlString = $value->xml->saveXML();
                $result[$field->fieldDefIdentifier] = $xmlString;
            } else {
                $result[$field->fieldDefIdentifier] = $value;
            }
        }

        return $result;
    }
}
