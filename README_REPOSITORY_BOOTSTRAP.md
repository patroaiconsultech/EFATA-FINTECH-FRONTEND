# EFATÀ 777 Frontend — Repository Bootstrap

This package combines the audited R1.1 frontend source with the approved connected qualification workflow.

## Recommended sequence

1. Create a new GitHub repository for the frontend.
2. Upload this package as the repository root.
3. Commit/push the initial source.
4. Run GitHub Actions:
   `EFATA 777 Frontend R1.1 Connected Qualification`
5. Approval phrase:
   `APPROVE_EFATA_777_FRONTEND_R1_1_CONNECTED_GATE`
6. Download the generated evidence artifact.
7. Audit the connected gate result.
8. If green, freeze/commit the generated `package-lock.json`.
9. Only then connect the repository to Railway.
10. Configure frontend environment variables in Railway.
11. Run frontend × backend smoke tests.

## Important

Do not connect production deployment before the connected qualification gate is green and the lockfile has been frozen.

This package does not modify backend code or migrations.
