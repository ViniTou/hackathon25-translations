<?php

declare(strict_types=1);

namespace Ibexa\Bundle\HackathonTranslations\Command;

use Ibexa\Bundle\HackathonTranslations\AI\GenerateTranslationsDiffAction;
use Ibexa\Contracts\ConnectorAi\ActionServiceInterface;
use Ibexa\Contracts\Core\Repository\Repository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand('app:generate-translations-diff', 'Generate translations diff using AI')]
final class GenerateTranslationDiffCommand extends Command
{
    public function __construct(
        private Repository $repository,
        private ActionServiceInterface $actionService,
    ) {
        parent::__construct();
    }

    public function configure(): void
    {
        $this->addOption(
            'user',
            'u',
            InputOption::VALUE_REQUIRED,
            'Ibexa DXP username',
            'admin'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->repository->getPermissionResolver()->setCurrentUserReference(
            $this->repository->getUserService()->loadUserByLogin($input->getOption('user'))
        );

        $io = new SymfonyStyle($input, $output);

        $contentId = $io->askQuestion(new Question('ContentID'));
        $versionNoA = $io->askQuestion(new Question('VersionNo A'));
        $versionLanguageA = $io->askQuestion(new Question('VersionLanguage A'));
        $versionNoB = $io->askQuestion(new Question('VersionNo B'));
        $versionLanguageB = $io->askQuestion(new Question('VersionLanguage B'));

        $versionInfoA = $this->repository->getContentService()->loadVersionInfoById(
            $contentId,
            $versionNoA
        );
        $versionInfoB = $this->repository->getContentService()->loadVersionInfoById(
            $contentId,
            $versionNoB
        );
        $contentA = $this->repository->getContentService()->loadContentByVersionInfo($versionInfoA, [$versionLanguageA]);
        $contentB = $this->repository->getContentService()->loadContentByVersionInfo($versionInfoB, [$versionLanguageB]);


        $action = new GenerateTranslationsDiffAction(
            $contentA->getFields(),
            $contentB->getFields(),
            $versionLanguageA,
            $versionLanguageB
        );

        $result = $this->actionService->execute($action)->getOutput();


        return self::SUCCESS;
    }
}
