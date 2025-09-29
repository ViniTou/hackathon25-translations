<?php

/**
 * @copyright Copyright (C) Ibexa AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
declare(strict_types=1);

namespace Ibexa\Bundle\HackathonTranslations\AI;

use Ibexa\Bundle\HackathonTranslations\AI\DataType\TranslationDiffOutputData;
use Ibexa\Contracts\ConnectorAi\DataType;

final class GenerateTranslationDiffActionResponse implements \Ibexa\Contracts\ConnectorAi\ActionResponseInterface
{

    private TranslationDiffOutputData $data;

    public function __construct(TranslationDiffOutputData $data)
    {
        $this->data = $data;
    }

    public function getOutput(): DataType
    {
        return $this->data;
    }
}
