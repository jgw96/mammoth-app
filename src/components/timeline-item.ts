import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { boostPost, getReplies, reblogPost } from '../services/timeline';

import '../components/user-profile';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { addBookmark } from '../services/bookmarks';

@customElement('timeline-item')
export class TimelineItem extends LitElement {
    @property({ type: Object }) tweet: any;
    @property({ type: Boolean }) show: boolean = false;

    @state() isBoosted = false;
    @state() isReblogged = false;
    @state() isBookmarked = false;

    static styles = [
        css`
            :host {
                display: block;

                width: 100%;

                margin-bottom: 10px;
            }


            sl-card {
                --padding: 10px;
                width: 100%;
                --sl-panel-background-color: #5c86ff69;
            }

            sl-card a {
                color: var(--sl-color-primary-600);
            }

            sl-card::part(base) {
                border: none;
            }

            sl-card::part(body) {
                padding-top: 0;
            }

            sl-card img {
                height: 420px;
                object-fit: contain;
            }

            .header-block {
                display: flex;
                align-items: center;
                gap: 14px;
            }

            .header-block img {
                height: 62px;
                border-radius: 50%;
            }

            .header-block h4 {
                margin-bottom: 0;
            }

            .actions {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
            }

            .actions sl-button::part(base) {
                background: transparent;
                border: none;
                font-size: 1.2em;
            }

            actions sl-button sl-icon {
                font-size: 1.2em;
            }

            sl-card::part(footer) {
                border-top: none;
            }

            @media(max-width: 600px) {
                .actions {
                    justify-content: space-between;
                }
            }

            @keyframes slideUp {
                0% {
                    transform: translateY(30%);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `
    ];

    firstUpdated( ) {
        // set up intersection observer
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage();

                    observer.unobserve(entry.target);
                }
            });
        }
        , options);

        observer.observe(this.shadowRoot?.querySelector('sl-card') as Element);
    }

    async loadImage() {
        window.requestIdleCallback(() => {
            const img = this.shadowRoot?.querySelector('img');
            if (img) {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.setAttribute('src', src);

                    window.requestIdleCallback(() => {
                        img.removeAttribute('data-src');
                    }, {
                        timeout: 1000
                    })
                }
            }
        }, {
            timeout: 1000
        })
    }

    async favorite(id: string) {
        console.log("favorite", id);
        await boostPost(id);

        this.isBoosted = true;

        // fire custom event
        this.dispatchEvent(new CustomEvent('favorite', {
            detail: {
                id
            }
        }));
    }

    async reblog(id: string) {
        console.log("reblog", id);
        await reblogPost(id);

        this.isReblogged = true;

        // fire custom event
        this.dispatchEvent(new CustomEvent('reblog', {
            detail: {
                id
            }
        }));
    }

    async bookmark(id: string) {
        console.log("bookmark", id);
        await addBookmark(id);

        this.isBookmarked = true;
    }

    async replies(id: string) {
      const data = await getReplies(id);
      console.log(data);

        // fire custom event
        this.dispatchEvent(new CustomEvent('replies', {
            detail: {
                data: data.descendants,
                id
            }
        }));
    }

    render() {
        return html`
          ${this.tweet.reblog === null || this.tweet.reblog === undefined ? html`
                <sl-card>
                      ${
                        this.tweet.media_attachments.length > 0 ? html`
                         <img slot="image" data-src="${this.tweet.media_attachments[0].preview_url}">
                        ` : html``
                      }


                        <user-profile .account="${this.tweet.account}"></user-profile>
                        <div .innerHTML="${this.tweet.content}"></div>

                        <div class="actions" slot="footer">
                          ${this.show === true ? html`<sl-button pill @click="${() => this.replies(this.tweet.id)}">
                            <sl-icon src="/assets/albums-outline.svg"></sl-icon>
                        </sl-button>` : null}
                          <sl-button ?disabled="${this.isBookmarked || this.tweet.bookmarked}" pill @click="${() => this.bookmark(this.tweet.id)}"><sl-icon src="/assets/bookmark-outline.svg"></sl-icon></sl-button>
                          <sl-button ?disabled="${this.isBoosted || this.tweet.favourited}" pill @click="${() => this.favorite(this.tweet.id)}">${this.tweet.favourites_count} <sl-icon src="/assets/heart-outline.svg"></sl-icon></sl-button>
                          <sl-button ?disabled="${this.isReblogged || this.tweet.reblogged}" pill @click="${() => this.reblog(this.tweet.id)}">${this.tweet.reblogs_count} <sl-icon src="/assets/repeat-outline.svg"></sl-icon></sl-button>
                        </div>
                    </sl-card>
                    ` : html`
                    <sl-card>
                    ${
                        this.tweet.reblog.media_attachments.length > 0 ? html`
                         <img slot="image" data-src="${this.tweet.reblog.media_attachments[0].preview_url}">
                        ` : html``
                      }

                        <div class="header-block" slot="header">

                            <user-profile ?small="${true}" .account="${this.tweet.account}"></user-profile>
                              <span>boosted</span>
                            <user-profile ?small="${true}"  .account="${this.tweet.reblog.account}"></user-profile>
                        </div>
                        <h5>${this.tweet.reblog.account.acct} posted</h5>

                        <div .innerHTML="${this.tweet.reblog.content}"></div>

                        <div class="actions" slot="footer">
                        ${this.show === true ? html`<sl-button pill @click="${() => this.replies(this.tweet.id)}">
                            <sl-icon src="/assets/albums-outline.svg"></sl-icon>
                        </sl-button>` : null}
                            <sl-button ?disabled="${this.isBoosted || this.tweet.favourited}" pill @click="${() => this.bookmark(this.tweet.id)}"><sl-icon src="/assets/bookmark-outline.svg"></sl-icon></sl-button>
                            <sl-button ?disabled="${this.isBoosted || this.tweet.favourited}" pill @click="${() => this.favorite(this.tweet.id)}">${this.tweet.reblog.favourites_count} <sl-icon src="/assets/heart-outline.svg"></sl-icon></sl-button>
                            <sl-button ?disabled="${this.isReblogged || this.tweet.reblogged}"  pill @click="${() => this.reblog(this.tweet.id)}">${this.tweet.reblog.reblogs_count} <sl-icon src="/assets/repeat-outline.svg"></sl-icon></sl-button>
                        </div>
                    </sl-card>


                    `}

        `;
    }
}
