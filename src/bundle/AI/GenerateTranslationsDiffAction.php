<?php

declare(strict_types=1);

namespace Ibexa\Bundle\HackathonTranslations\AI;

use Ibexa\Bundle\HackathonTranslations\AI\DataType\TranslationsDiff;
use Ibexa\Contracts\ConnectorAi\Action\Action as BaseAction;
use Ibexa\Contracts\ConnectorAi\Action\DataType\Text;
use Ibexa\Contracts\ConnectorAi\DataType;
use Ibexa\Contracts\Core\Repository\Values\Content\Language;
use Ibexa\Contracts\Core\Repository\Values\Content\VersionInfo;

final class GenerateTranslationsDiffAction extends BaseAction
{
    public function __construct(
        private array $fieldsA,
        private array $fieldsB,
        private string $languageA,
        private string $languageB,
    )
    {
    }

    public function getActionTypeIdentifier(): string
    {
        return 'generate_translations_diff';
    }

    public function getParameters(): array
    {
        return [];
    }

    public function getInput(): DataType
    {
        return new TranslationsDiff(
            $this->fieldsA,
            $this->fieldsB,
            $this->languageA,
            $this->languageB
        );
    }

    public function getFieldsA(): array
    {
        return $this->fieldsA;
    }

    public function getFieldsB(): array
    {
        return $this->fieldsB;
    }

    public function getLanguageA(): string
    {
        return $this->languageA;
    }

    public function getLanguageB(): string
    {
        return $this->languageB;
    }



}
