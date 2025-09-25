<?php

declare(strict_types=1);

namespace Ibexa\Bundle\HackathonTranslations\AI;

use Ibexa\ConnectorOpenAi\ActionHandler\AbstractActionHandler;
use Ibexa\ConnectorOpenAi\ActionHandler\ChatActionResponseFormatter;
use Ibexa\Contracts\ConnectorAi\ActionInterface;
use Ibexa\Contracts\ConnectorAi\ActionResponseInterface;
use Ibexa\Contracts\ConnectorAi\ActionType\ActionTypeRegistryInterface;
use Ibexa\Contracts\ConnectorOpenAi\ClientProviderInterface;
use Ibexa\Contracts\Core\Repository\LanguageResolver;
use Ibexa\Contracts\Core\Repository\LanguageService;

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
                                'Generate Translations diff and suggestions for specified versions and languages ',
                                [
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

        $text = $this->formatter->format($json);
//        if (empty($text)) {
//            return new GeneratePageBuilderBlockActionResponse(new BlockGeneratorOutputData());
//        }

        $decoded = json_decode($text[0], true);

//        return new GeneratePageBuilderBlockActionResponse(
//            new BlockGeneratorOutputData(
//                $decoded['block_identifier'] ?? '',
//                $decoded['yaml_configuration'] ?? '',
//                $decoded['twig_template'] ?? '',
//            )
//        );
    }

    public static function getIdentifier(): string
    {
        return 'openai-generate-translations-diff';
    }

    public function getSystemPrompt(): string
    {
        return file_get_contents(__DIR__ . '/../../prompt/generate_page_builder_block.md');
    }
}
