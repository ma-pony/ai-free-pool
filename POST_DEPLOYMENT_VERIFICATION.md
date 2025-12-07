# Post-Deployment Verification Guide

This guide provides a comprehensive checklist for verifying the AI Free Pool deployment after going live.

## Overview

After deploying to production, it's critical to verify that all features work correctly and the system is stable. This guide covers:

1. Immediate verification (first 30 minutes)
2. Short-term monitoring (first 24 hours)
3. Long-term monitoring (first week)

## Immediate Verification (First 30 Minutes)

### 1. Basic Connectivity

- [ ] **Homepage loads**
  - Visit: `https://your-domain.com`
  - Expected: Homepage displays without errors
  - Check: No 404 or 500 errors

- [ ] **HTTPS is enforced**
  - Visit: `http://your-domain.com`
  - Expected: Redirects to HTTPS
  - Check: SSL certificate is valid

- [ ] **Favicon loads**
  - Check browser tab
  - Expected: Favicon displays correctly

### 2. Language and Internationalization

- [ ] **Default language detection**
  - Visit homepage
  - Expected: Correct language based on browser settings
  - Test: EN and ZH

- [ ] **Language switcher works**
  - Click language switcher
  - Expected: Page content changes language
  - Test: Switch between EN and ZH

- [ ] **URL structure correct**
  - Check URL after language switch
  - Expected: `/en/` or `/zh/` in URL
  - Test: Both language URLs work

### 3. Navigation

- [ ] **Header navigation**
  - Click all header links
  - Expected: All links work
  - Test: Home, Campaigns, About, etc.

- [ ] **Footer navigation**
  - Click all footer links
  - Expected: All links work
  - Test: Privacy, Terms, Social media links

- [ ] **Mobile navigation**
  - Test on mobile device or DevTools
  - Expected: Hamburger menu works
  - Test: Bottom navigation bar works

### 4. Campaign Features

- [ ] **Campaign list loads**
  - Visit: `/en/campaigns`
  - Expected: Campaigns display in grid
  - Check: Images load, data displays correctly

- [ ] **Campaign details load**
  - Click on a campaign
  - Expected: Detail page loads
  - Check: All information displays

- [ ] **Search works**
  - Enter search term
  - Expected: Results filter correctly
  - Test: Multiple search terms

- [ ] **Filters work**
  - Apply various filters
  - Expected: Results update correctly
  - Test: Category, AI model, difficulty, etc.

- [ ] **Pagination/Infinite scroll**
  - Scroll to bottom or click next page
  - Expected: More campaigns load
  - Check: No duplicate items

### 5. Authentication

- [ ] **Sign up with Google**
  - Click "Sign Up"
  - Choose Google
  - Expected: OAuth flow completes
  - Check: Redirects to dashboard

- [ ] **Sign up with GitHub**
  - Click "Sign Up"
  - Choose GitHub
  - Expected: OAuth flow completes
  - Check: Redirects to dashboard

- [ ] **Sign in works**
  - Sign out, then sign in
  - Expected: Authentication succeeds
  - Check: User session persists

- [ ] **Sign out works**
  - Click "Sign Out"
  - Expected: User is logged out
  - Check: Redirects to homepage

- [ ] **Protected routes**
  - Try accessing `/en/dashboard` without login
  - Expected: Redirects to sign-in
  - Check: After login, redirects back

### 6. User Features

- [ ] **User profile loads**
  - Visit: `/en/dashboard/profile`
  - Expected: Profile displays
  - Check: User info, stats, tabs

- [ ] **Submit campaign**
  - Fill out submission form
  - Expected: Form submits successfully
  - Check: Campaign appears in pending list

- [ ] **Bookmark campaign**
  - Click bookmark button
  - Expected: Campaign is bookmarked
  - Check: Appears in bookmarks list

- [ ] **Add reaction**
  - Click reaction button
  - Expected: Reaction is recorded
  - Check: Count updates

- [ ] **Post comment**
  - Write and submit comment
  - Expected: Comment appears
  - Check: Comment displays correctly

- [ ] **Reply to comment**
  - Reply to existing comment
  - Expected: Reply appears nested
  - Check: Nesting displays correctly

- [ ] **Add emoji reaction to comment**
  - Click emoji on comment
  - Expected: Emoji reaction added
  - Check: Count updates

### 7. Admin Features (If Admin)

- [ ] **Admin dashboard loads**
  - Visit: `/en/admin`
  - Expected: Dashboard displays
  - Check: Statistics, charts, quick actions

- [ ] **Pending campaigns list**
  - Visit: `/en/admin/pending`
  - Expected: Pending campaigns display
  - Check: Can view details

- [ ] **Approve campaign**
  - Approve a pending campaign
  - Expected: Status changes to published
  - Check: Appears in public list

- [ ] **Reject campaign**
  - Reject a pending campaign
  - Expected: Status changes to rejected
  - Check: Does not appear in public list

- [ ] **Edit campaign**
  - Edit campaign details
  - Expected: Changes save successfully
  - Check: Changes reflect immediately

- [ ] **Manage platforms**
  - Add/edit platform
  - Expected: Platform saves
  - Check: Appears in platform list

- [ ] **Manage tags**
  - Add/edit tag
  - Expected: Tag saves
  - Check: Appears in tag list

- [ ] **Set featured campaign**
  - Set campaign as featured
  - Expected: Campaign marked as featured
  - Check: Appears in featured carousel

### 8. Database Connectivity

- [ ] **Data persists**
  - Create data (campaign, comment, etc.)
  - Refresh page
  - Expected: Data still exists
  - Check: No data loss

- [ ] **Queries execute**
  - Perform various actions
  - Expected: No database errors
  - Check: Response times < 500ms

- [ ] **Transactions work**
  - Perform complex operations
  - Expected: Data consistency maintained
  - Check: No partial updates

### 9. API Endpoints

- [ ] **Campaign API**
  - Test: `GET /api/campaigns`
  - Expected: Returns campaign list
  - Check: Correct data structure

- [ ] **Platform API**
  - Test: `GET /api/platforms`
  - Expected: Returns platform list
  - Check: Correct data structure

- [ ] **Reaction API**
  - Test: `POST /api/reactions`
  - Expected: Creates reaction
  - Check: Returns success response

- [ ] **Comment API**
  - Test: `POST /api/comments`
  - Expected: Creates comment
  - Check: Returns success response

### 10. Security

- [ ] **HTTPS enforced**
  - Try HTTP
  - Expected: Redirects to HTTPS
  - Check: SSL certificate valid

- [ ] **API encryption**
  - Check network tab
  - Expected: Sensitive data encrypted
  - Check: No plain text secrets

- [ ] **Rate limiting**
  - Make rapid requests
  - Expected: Rate limit kicks in
  - Check: 429 status code returned

- [ ] **Bot detection**
  - Check Arcjet dashboard
  - Expected: Bot detection active
  - Check: Search engines allowed

- [ ] **CORS configured**
  - Check from different origin
  - Expected: CORS headers present
  - Check: Only allowed origins

### 11. Analytics

- [ ] **Google Analytics tracking**
  - Visit pages
  - Check GA dashboard
  - Expected: Page views recorded
  - Check: Real-time data appears

- [ ] **Event tracking**
  - Perform actions (click, submit, etc.)
  - Check GA dashboard
  - Expected: Events recorded
  - Check: Event parameters correct

- [ ] **User tracking**
  - Sign in and perform actions
  - Check GA dashboard
  - Expected: User ID tracked
  - Check: User properties set

### 12. Error Monitoring

- [ ] **Sentry connected**
  - Check Sentry dashboard
  - Expected: Project shows as active
  - Check: No critical errors

- [ ] **Error tracking works**
  - Trigger a test error (if possible)
  - Check Sentry dashboard
  - Expected: Error appears
  - Check: Stack trace is complete

- [ ] **Source maps uploaded**
  - Check error in Sentry
  - Expected: Source code visible
  - Check: Line numbers correct

### 13. Performance

- [ ] **Page load time**
  - Use Lighthouse or PageSpeed Insights
  - Expected: < 3 seconds
  - Check: Performance score > 80

- [ ] **Image optimization**
  - Check image formats
  - Expected: WebP format used
  - Check: Images lazy load

- [ ] **API response time**
  - Check network tab
  - Expected: < 500ms for most requests
  - Check: No slow queries

- [ ] **Caching works**
  - Reload page
  - Expected: Faster second load
  - Check: Cache headers present

### 14. SEO

- [ ] **Meta tags present**
  - View page source
  - Expected: Title, description, keywords
  - Check: Unique per page

- [ ] **Open Graph tags**
  - Share on social media
  - Expected: Preview shows correctly
  - Check: Image, title, description

- [ ] **JSON-LD structured data**
  - View page source
  - Expected: Structured data present
  - Check: Valid JSON-LD

- [ ] **Sitemap accessible**
  - Visit: `/sitemap.xml`
  - Expected: Sitemap displays
  - Check: All pages listed

- [ ] **Robots.txt accessible**
  - Visit: `/robots.txt`
  - Expected: Robots.txt displays
  - Check: Correct directives

### 15. Mobile Optimization

- [ ] **Responsive layout**
  - Test on mobile device
  - Expected: Layout adapts
  - Check: No horizontal scroll

- [ ] **Touch targets**
  - Test buttons on mobile
  - Expected: Easy to tap
  - Check: Minimum 44x44 pixels

- [ ] **Bottom navigation**
  - Test on mobile
  - Expected: Navigation works
  - Check: Active state shows

- [ ] **Filter drawer**
  - Open filters on mobile
  - Expected: Drawer slides in
  - Check: Can close drawer

- [ ] **Pull-to-refresh**
  - Pull down on mobile
  - Expected: Page refreshes
  - Check: Loading indicator shows

- [ ] **Native share**
  - Click share button on mobile
  - Expected: Native share dialog opens
  - Check: Correct URL shared

## Browser Console Checks

Open browser DevTools (F12) and check:

### Console Tab
- [ ] No JavaScript errors
- [ ] No warning messages
- [ ] No failed API calls

### Network Tab
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] All resources load
- [ ] Response times reasonable

### Application Tab
- [ ] Cookies set correctly
- [ ] Local storage works
- [ ] Session storage works

## Short-Term Monitoring (First 24 Hours)

### Hour 1-2: Active Monitoring

- [ ] **Monitor error rates**
  - Check Sentry every 15 minutes
  - Expected: < 1% error rate
  - Action: Investigate any spikes

- [ ] **Monitor performance**
  - Check Vercel Analytics
  - Expected: Consistent response times
  - Action: Investigate slow requests

- [ ] **Monitor database**
  - Check connection count
  - Expected: Within limits
  - Action: Adjust pool size if needed

- [ ] **Monitor API usage**
  - Check OpenAI usage
  - Check Clerk usage
  - Expected: Within quotas
  - Action: Adjust limits if needed

### Hour 2-24: Periodic Checks

Check every 2-4 hours:

- [ ] **Error rates stable**
  - Sentry dashboard
  - Expected: No increase in errors

- [ ] **Performance stable**
  - Vercel Analytics
  - Expected: Consistent metrics

- [ ] **User feedback**
  - Check support channels
  - Expected: No critical issues

- [ ] **Database health**
  - Check query performance
  - Expected: No slow queries

## Long-Term Monitoring (First Week)

### Daily Checks

- [ ] **Review error logs**
  - Sentry dashboard
  - Action: Fix any recurring errors

- [ ] **Review performance**
  - Vercel Analytics
  - Action: Optimize slow pages

- [ ] **Review user feedback**
  - Support channels
  - Action: Address issues

- [ ] **Review API usage**
  - OpenAI, Clerk dashboards
  - Action: Optimize if needed

### Weekly Review

- [ ] **Error trends**
  - Review error patterns
  - Action: Fix root causes

- [ ] **Performance trends**
  - Review performance metrics
  - Action: Optimize bottlenecks

- [ ] **User engagement**
  - Review analytics
  - Action: Improve UX

- [ ] **Cost analysis**
  - Review service costs
  - Action: Optimize spending

## Verification Checklist Summary

### Critical (Must Pass)

- [ ] Homepage loads
- [ ] Authentication works
- [ ] Database connected
- [ ] API endpoints work
- [ ] HTTPS enforced
- [ ] No critical errors

### Important (Should Pass)

- [ ] All features work
- [ ] Performance acceptable
- [ ] Analytics tracking
- [ ] Error monitoring active
- [ ] SEO configured
- [ ] Mobile optimized

### Nice to Have (Can Fix Later)

- [ ] Minor UI issues
- [ ] Performance optimizations
- [ ] Additional features
- [ ] Documentation updates

## Issue Tracking

Use this template to track issues found:

```markdown
## Issue: [Brief Description]

**Severity:** Critical / High / Medium / Low
**Category:** Functionality / Performance / Security / UX
**Found:** [Date/Time]
**Status:** Open / In Progress / Resolved

### Description
[Detailed description of the issue]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshots/Logs
[Attach screenshots or error logs]

### Resolution
[How it was fixed]

### Verified
- [ ] Fix deployed
- [ ] Issue resolved
- [ ] No regression
```

## Rollback Criteria

Rollback immediately if:

- [ ] Critical errors affecting > 10% of users
- [ ] Database connection failures
- [ ] Authentication completely broken
- [ ] Data loss or corruption
- [ ] Security vulnerability exposed
- [ ] Site completely down

## Success Criteria

Deployment is successful if:

- [ ] All critical checks pass
- [ ] Error rate < 1%
- [ ] Performance acceptable (< 3s load time)
- [ ] No data loss
- [ ] No security issues
- [ ] User feedback positive

## Sign-Off

Once all verifications pass:

- [ ] Technical Lead approval: _________________ Date: _______
- [ ] Product Manager approval: _________________ Date: _______
- [ ] QA approval: _________________ Date: _______

## Next Steps

After successful verification:

1. [ ] Update status page (if applicable)
2. [ ] Announce launch to users
3. [ ] Monitor for first week
4. [ ] Schedule post-launch review
5. [ ] Document lessons learned

## Resources

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry Dashboard:** https://sentry.io
- **Google Analytics:** https://analytics.google.com
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Database Dashboard:** [Your database provider]

## Support Contacts

- **Technical Lead:** [Name] - [Email] - [Phone]
- **DevOps:** [Name] - [Email] - [Phone]
- **Database Admin:** [Name] - [Email] - [Phone]
- **On-Call:** [Name] - [Email] - [Phone]

---

**Verification Date:** _________________

**Verified By:** _________________

**Deployment Version:** _________________

**Status:** ⬜ In Progress | ⬜ Passed | ⬜ Failed

**Notes:**

---

## Conclusion

Thorough post-deployment verification ensures a stable and reliable production environment. Take your time with each check, document any issues, and don't hesitate to rollback if critical problems are found.

Remember: It's better to catch issues early than to let them affect users!
