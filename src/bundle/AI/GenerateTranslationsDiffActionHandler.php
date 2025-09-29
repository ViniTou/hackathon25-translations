<?php

declare(strict_types=1);

namespace Ibexa\Bundle\HackathonTranslations\AI;

use Ibexa\Bundle\HackathonTranslations\AI\DataType\TranslationDiffOutputData;
use Ibexa\ConnectorOpenAi\ActionHandler\AbstractActionHandler;
use Ibexa\ConnectorOpenAi\ActionHandler\ChatActionResponseFormatter;
use Ibexa\Contracts\ConnectorAi\ActionInterface;
use Ibexa\Contracts\ConnectorAi\ActionResponseInterface;
use Ibexa\Contracts\ConnectorAi\ActionType\ActionTypeRegistryInterface;
use Ibexa\Contracts\ConnectorOpenAi\ClientProviderInterface;
use Ibexa\Contracts\Core\Repository\LanguageResolver;
use Ibexa\Contracts\Core\Repository\LanguageService;
use Ibexa\Contracts\Core\Repository\Values\Content\Field;

final class GenerateTranslationsDiffActionHandler extends AbstractActionHandler
{
    private ChatActionResponseFormatter $formatter;

    public function __construct(
        ClientProviderInterface $clientProvider,
        ActionTypeRegistryInterface $actionTypeRegistry,
        LanguageService $languageService,
        LanguageResolver $languageResolver,
        ChatActionResponseFormatter $formatter,
    ) {
        parent::__construct($clientProvider, $actionTypeRegistry, $languageService, $languageResolver);
        $this->formatter = $formatter;
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
                                    '%fieldsA%' => json_encode($this->prepareFields($action->getFieldsA())),
                                    '%fieldsB%' => json_encode($this->prepareFields($action->getFieldsB())),
                                ]
                            ),
                        ],
                    ],
                ],
            ],
            'response_format' => [
                'type' => 'json_schema',
                'json_schema' => [
                    'name' => 'validation_results',
                    'schema' => [
                        'type' => 'object',
                        'properties' => [
                            'issues' => [
                                'type' => 'array',
                                'items' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'id' => ['type' => 'string'],
                                        'type' => ['type' => 'string'],
                                        'field' => ['type' => 'string'],
                                        'severity' => ['type' => 'string'],
                                        'title' => ['type' => 'string'],
                                        'description' => ['type' => 'string'],
                                        'suggestion' => ['type' => 'string'],
                                        'impact' => ['type' => 'string'],
                                    ],
                                    'required' => [
                                        'id','type','field','severity',
                                        'title','description','suggestion','impact'
                                    ]
                                ]
                            ]
                        ],
                        'required' => ['results']
                    ]
                ]
            ],
            'max_completion_tokens' => $options['max_tokens'],
            'temperature' => $options['temperature'],
        ]);

        $this->validateResponse($json);

        $text = $this->formatter->format($json);
        if (empty($text)) {
            return new GenerateTranslationDiffActionResponse(new TranslationDiffOutputData([]));
        }

        $decoded = json_decode($text[0], true);

        return new GenerateTranslationDiffActionResponse(new TranslationDiffOutputData([$decoded]));
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
            $result[$field->fieldDefIdentifier] = (string)$value;
        }

        return $result;
    }
}
