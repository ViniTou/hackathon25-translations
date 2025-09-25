<?php

/**
 * @copyright Copyright (C) Ibexa AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
declare(strict_types=1);

namespace Ibexa\Bundle\HackathonTranslations\AI\DataType;

use Ibexa\Contracts\ConnectorAi\DataType;

class TranslationsDiff implements DataType
{
    public const string IDENTIFIER = 'translations_diff';

    private array $fieldsA;
    private array $fieldsB;

    private string $languageA;
    private string $languageB;

    public function getList(): array
    {
        return [$this->fieldsA, $this->fieldsB, $this->languageA, $this->languageB];
    }

    public static function getIdentifier(): string
    {
        return self::IDENTIFIER;
    }
}
