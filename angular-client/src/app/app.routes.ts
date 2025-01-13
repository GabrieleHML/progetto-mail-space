import { Routes } from '@angular/router';

import { MailViewerComponent } from './components/mail-viewer/mail-viewer.component';
import { MailUploaderComponent } from './components/mail-uploader/mail-uploader.component';

export const routes: Routes = [
    { path: 'mails', component: MailViewerComponent },
    { path: 'add-mail', component: MailUploaderComponent}
];
