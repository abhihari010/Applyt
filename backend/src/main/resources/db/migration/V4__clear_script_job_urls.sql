-- job_url was never validated and is rendered as a link, so remove any stored script URLs.
UPDATE applications
SET job_url = NULL
WHERE job_url ~* '^\s*(javascript|data|vbscript):';
