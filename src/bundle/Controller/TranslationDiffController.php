<?php

declare(strict_types=1);

namespace Ibexa\Bundle\HackathonTranslations\Controller;

use Ibexa\Bundle\HackathonTranslations\AI\GenerateTranslationsDiffAction;
use Ibexa\Contracts\ConnectorAi\ActionServiceInterface;
use Ibexa\Contracts\Core\Repository\Repository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TranslationDiffController extends AbstractController
{
    public function __construct(
        private Repository $repository,
        private ActionServiceInterface $actionService,
    ) {
    }

    #[Route('/api/translations/diff/{contentId}/{versionA}/{languageA}/{versionB}/{languageB}', name: 'ibexa.translations.diff', methods: ['GET', 'POST'])]
    public function getDiff(
        int $contentId,
        int $versionA,
        string $languageA,
        int $versionB,
        string $languageB
    ): Response {
        try {
            $versionInfoA = $this->repository->getContentService()->loadVersionInfoById(
                $contentId,
                $versionA
            );
            $versionInfoB = $this->repository->getContentService()->loadVersionInfoById(
                $contentId,
                $versionB
            );

            $contentA = $this->repository->getContentService()->loadContentByVersionInfo($versionInfoA, [$languageA]);
            $contentB = $this->repository->getContentService()->loadContentByVersionInfo($versionInfoB, [$languageB]);

            $action = new GenerateTranslationsDiffAction(
                $contentA->getFieldsByLanguage($languageA),
                $contentB->getFieldsByLanguage($languageB),
                $languageA,
                $languageB
            );

            $result = $this->actionService->execute($action)->getOutput();

            return new JsonResponse([
                'diff' => json_decode($result->getText()),
                'content_id' => $contentId,
                'version_a' => [
                    'number' => $versionA,
                    'language' => $languageA,
                ],
                'version_b' => [
                    'number' => $versionB,
                    'language' => $languageB,
                ],
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}
