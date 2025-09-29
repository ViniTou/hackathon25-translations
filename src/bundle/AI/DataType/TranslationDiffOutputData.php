<?php

/**
 * @copyright Copyright (C) Ibexa AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
declare(strict_types=1);

namespace Ibexa\Bundle\HackathonTranslations\AI\DataType;

use Ibexa\Contracts\ConnectorAi\DataType;

final class TranslationDiffOutputData implements DataType
{

    private array $fieldsDiff;

    public function __construct(array $fieldsDiff)
    {
        $this->fieldsDiff = $fieldsDiff;
    }

    public function getList(): array
    {
        return $this->fieldsDiff;
    }

    public static function getIdentifier(): string
    {
        return 'translation_diff';
    }
}
