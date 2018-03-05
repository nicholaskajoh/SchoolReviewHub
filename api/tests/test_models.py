from django.test import TestCase
from .factories import *
from api.models import School, Review, Comment, Comparison, Criterion, Report, Upvote

class SchoolTestCase(TestCase):
    
    def setUp(self):
        pass

    def test_school_string_representation(self):
        school = SchoolFactory()
        self.assertEqual(str(school), school.name)


class ReviewTestCase(TestCase):
    
    def setUp(self):
        pass
  
    def test_review_string_representation(self):
        review = ReviewFactory()
        self.assertEqual(str(review), review.content)


class CommentTestCase(TestCase):
    
    def setUp(self):
        pass
  
    def test_comment_string_representation(self):
        review = ReviewFactory()
        comment = CommentFactory(entity_id=review.pk)
        self.assertEqual(str(comment), comment.comment)


class ComparisonTestCase(TestCase):      
    
    def setUp(self):
        self.comparison = ComparisonFactory()
    
    def test_comparison_string_representation(self):
        self.assertEqual(str(self.comparison),"{0} (vs) {1} [{2}], {3}".format(
            self.comparison.school1, self.comparison.school2,
            self.comparison.criterion,self.comparison.comparer)
        )
    
    def test_comparison_rejects_comparing_the_same_school(self):
        # update the second school field to be the same school
        self.comparison.school2 = self.comparison.school1
        # test if the save() method raises an execption
        with self.assertRaises(ValueError):
            self.comparison.save()


class CriterionTestCase(TestCase):
    
    def setUp(self):
        pass

    def test_criterion_string_representation(self):
        criterion = CriterionFactory()
        self.assertEqual(str(criterion), criterion.description)


class ReportTestCase(TestCase):
    
    def setUp(self):
        pass

    def test_report_string_representation(self):
        report = ReportFactory()
        self.assertEqual(str(report), report.content)


class UpvoteTestCase(TestCase):
    
    def setUp(self):
        pass
    
    def test_upvote_string_representation_for_review(self):
        review = ReviewFactory()
        upvote = UpvoteFactory(entity_id=review.pk, 
            entity=Upvote.REVIEW
        )
        string_rep = '{} upvotes {}: \'{}\''.format(upvote.upvoter.username,
            Upvote.REVIEW, review.content
        )
        if len(review.content) > 10:
            string_rep = '{} upvotes {}: \'{}...\''.format(upvote.upvoter.username,
                Upvote.REVIEW, review.content[:10]
            )
        self.assertEqual(str(upvote), string_rep)
    
    def test_upvote_string_representation_for_report(self):
        report = ReportFactory()
        upvote = UpvoteFactory(entity_id=report.pk, 
            entity=Upvote.REPORT
        )
        string_rep = '{} upvotes {}: \'{}\''.format(upvote.upvoter.username,
            Upvote.REPORT, report.content
        )
        if len(report.content) > 10:
            string_rep = '{} upvotes {}: \'{}...\''.format(upvote.upvoter.username,
                Upvote.REPORT, report.content[:10]
            )
        self.assertEqual(str(upvote), string_rep)