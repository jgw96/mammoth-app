import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { Post } from '../interfaces/Post';

import './timeline-item';

@customElement('app-bookmarks')
export class Bookmarks extends LitElement {
    @state() bookmarks = [];

    static styles = [
        css`
            :host {
                display: block;

                contain: paint layout style;
                content-visibility: auto;
            }

            ul {
                display: flex;
                flex-direction: column;
                margin: 0;
                padding: 0;
                list-style: none;

                height: 90vh;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            @media (max-width: 768px) {
                ul {
                    padding-left: 10px;
                    padding-right: 10px;
                }
            }

            ul::-webkit-scrollbar {
                display: none;
            }
        `
    ];

    async connectedCallback() {
        super.connectedCallback();

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {

            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const { getBookmarks } = await import('../services/bookmarks');
                    const bookmarksData = await getBookmarks();
                    console.log(bookmarksData);

                    this.bookmarks = bookmarksData;

                    observer.disconnect();
                }
            });
        }
        , options);

        observer.observe(this);

    }

    render() {
        return html`
          <ul>
            ${
                this.bookmarks.map((bookmark: Post) => {
                    return html`
                        <timeline-item .tweet=${bookmark}></timeline-item>
                    `;
                })
            }
          </ul>
        `;
    }
}
