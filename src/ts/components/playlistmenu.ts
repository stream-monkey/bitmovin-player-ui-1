import { Container, ContainerConfig } from './container';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { PlayerAPI } from 'bitmovin-player';
import { PlaylistMenuItem } from './playlistmenuitem';
import { PlaylistMenuNavButton } from './playlistmenunavbutton';
import { Button, ButtonConfig } from './button';

/**
 * Configuration interface for a {@link PlaylistMenu}.
 */
export interface PlaylistMenuConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the share panel will be hidden when there is no user interaction.
   * Set to -1 to disable automatic hiding.
   * Default: 3 seconds (3000)
   */
  hideDelay?: number;

  data: { items: any[] };
}

/**
 * A menu for navigating through a playlist.
 */
export class PlaylistMenu extends Container<PlaylistMenuConfig> {

  private hideTimeout: Timeout;

  constructor(config: PlaylistMenuConfig) {
    super(config);

    let components: any[] = [];

    config.data.items.forEach(item => {
      components.push(new PlaylistMenuItem(item));
    });

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-playlistmenu'],
      hidden: true,
      hideDelay: 3000,
      components,
    } as PlaylistMenuConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let uiconfig = uimanager.getConfig();
    
    // console.log('PlaylistMenu.configure - config.data', config.data)

    // Set the initial position of the button, since it's absolutely
    // positioned within the main player container, out of necessity.
    setTimeout(() => {
      console.log('playlistmenu offset, height', 
        this.getDomElement().get(0).offsetTop,
        this.getDomElement().get(0).clientHeight)
      // Gotta access these via the DOM vs. more elegantly passing them
      // through as a configuration property – chicken & egg dilemma: 
      // the nav buttons need to access the playlist element for
      // all of their event listeners / interactions.
      // ...
    }, 1000)
    
    // Auto-hiding.
    if (config.hideDelay > -1) {
      this.hideTimeout = new Timeout(config.hideDelay, () => {
        this.hide();
      });

      this.onShow.subscribe(() => {
        // Activate timeout when shown
        this.hideTimeout.start();
      });
      this.getDomElement().on('mouseenter', () => {
        // On mouse enter clear the timeout
        this.hideTimeout.clear();
      });
      this.getDomElement().on('mouseleave', () => {
        // On mouse leave activate the timeout
        this.hideTimeout.reset();
      });
      this.onHide.subscribe(() => {
        // Clear timeout when hidden from outside
        this.hideTimeout.clear();
      });
    }
  }
}
