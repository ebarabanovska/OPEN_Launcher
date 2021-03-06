import {Component, Injector} from 'angular2/core';
import {Router, CanActivate} from 'angular2/router';

import {AuthService} from '../../shared/services/AuthService';
import {UserSettingsService} from '../../shared/services/UserSettingsService';
import {GameLauncherService} from './GameLauncherService';
import {AlertingService} from '../../shared/services/AlertingService';

import {LearningWithTheComputer} from '../../shared/enums/GamesEnum';
import {GameModel} from './GameModel';

import {appInjector} from '../../../appInjector';

@Component({
  selector: 'home',
  templateUrl: `./app/components/home/home.html`
})
@CanActivate(
  (nextInstr: any, currInstr: any) => {
    let injector: any = appInjector();
    let authService: AuthService = injector.get(AuthService);
    let router: Router = injector.get(Router);
    let isLogged = authService.isLogged();

    if (!isLogged) {
      router.navigate(['/Login']);
    }
    return isLogged;
  }
)
export class HomeComponent {
  public getToKnowTheComputer: GameModel = new GameModel(
    'Причина и последица',
    'cause_and_effect.png',
    'java -jar {gamesPath}cause_and_effect_1.0.jar');

  public learningWithTheComputer: Array<GameModel> = [
    new GameModel('Парови', 'sets.png', '{gamesPath}OPEN_Sets-win32-x64/OPEN_Sets.exe'),
    new GameModel('Кој се крие', 'computer.png', ''),
    new GameModel('Сложувалка', 'computer.png', ''),
    new GameModel('Јас и мојот дом', 'computer.png', ''),
    new GameModel('Приказна', 'computer.png', '')
  ];

  public currentUserName: string;

  constructor(
    private alertingService: AlertingService,
    private authService: AuthService,
    private userSettingsService: UserSettingsService,
    private gameLauncherService: GameLauncherService) {
    this.currentUserName = this.authService.getLoggedUser();
  }

  loadGame(selectedGame) {
    this.gameLauncherService.isGameStarted().subscribe(data => {
      let isGameStarted: boolean = data;
      if (isGameStarted) {
        this.alertingService.addInfo('Моментално имате започнато игра. Затворете го прозорецот со активната игра за да започнете нова.');
        return;
      }

      switch (selectedGame) {
        case this.getToKnowTheComputer.name:
          this.loadCauseAndEffectGame();
          break;
        case this.learningWithTheComputer[LearningWithTheComputer.Pairs].name:
          this.loadPairsGame();
          break;
        // case this.learningWithTheComputer[LearningWithTheComputer.WhoIsHiding].name:
        //   break;
        // case this.learningWithTheComputer[LearningWithTheComputer.Puzzle].name:
        //   break;
        // case this.learningWithTheComputer[LearningWithTheComputer.MeAndMyHome].name:
        //   break;
        // case this.learningWithTheComputer[LearningWithTheComputer.Story].name:
        //   break;
        default:
          break;
      }
    });
  }

  loadCauseAndEffectGame() {
    this.userSettingsService.getUserSettingsForJar(this.currentUserName)
      .subscribe(userSettings => {
        this.gameLauncherService.loadGame(this.getToKnowTheComputer.startCommand + userSettings)
          .subscribe(res => { });
      });
  }

  loadPairsGame() {
    this.userSettingsService.getUserSettingsForElectron(this.currentUserName)
      .subscribe(userSettings => {
        this.gameLauncherService.loadGame(this.learningWithTheComputer[LearningWithTheComputer.Pairs].startCommand + userSettings)
          .subscribe(res => { });
      });
  }
}
