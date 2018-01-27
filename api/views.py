from django.http import Http404
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework import status, generics
from django.contrib.auth.models import User
from api.models import *
from api.serializers import *
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import datetime
from django.utils import timezone
from django.db.models import Q
from random import shuffle

# Pagination function.
def paginate(input_list, page, results_per_page=10):
    paginator = Paginator(input_list, results_per_page)
    try:
        output_list = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver 1st page.
        output_list = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), return last page.
        output_list = paginator.page(paginator.num_pages)
    return output_list

class SchoolView(generics.RetrieveAPIView):
    queryset = School.objects.all()
    lookup_field = 'id'
    serializer_class = SchoolSerializer


class SchoolReviewsView(APIView):
    def get(self, request, id, page=1):
        reviews = Review.objects.filter(school__id=id).order_by('-updated_at')
        reviews = paginate(reviews, page, 1)
        serializer =  ReviewSerializer(reviews, many=True)
        response = Response(serializer.data)
        # add pagination headers
        response['X-Has-Previous'] = reviews.has_previous()
        response['X-Has-Next'] = reviews.has_next()
        return response


class SchoolReportsView(APIView):
    def get(self, request, id, page=1):
        reports = Report.objects.filter(school__id=id).order_by('-updated_at')
        reports = paginate(reports, page, 10)
        serializer =  ReportSerializer(reports, many=True)
        response = Response(serializer.data)
        # add pagination headers
        response['X-Has-Previous'] = reports.has_previous()
        response['X-Has-Next'] = reports.has_next()
        return response


class SchoolsListView(generics.ListAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolsListSerializer


class TopSchoolsView(generics.ListAPIView):
    queryset = School.objects.all()[:5]
    serializer_class = SchoolSerializer


class SRHIndexView(APIView):
    def get(self, request, page=1):
        srhi = School.objects.all().order_by('rank')
        srhi = paginate(srhi, page, 20)
        serializer =  SchoolSerializer(srhi, many=True)
        response = Response(serializer.data)
        # add pagination headers
        response['X-Has-Previous'] = srhi.has_previous()
        response['X-Has-Next'] = srhi.has_next()
        return response


class ReviewView(generics.RetrieveAPIView):
    queryset = Review.objects.all()
    lookup_field = 'id'
    serializer_class = ReviewSerializer


class ReportView(generics.RetrieveAPIView):
    queryset = Report.objects.all()
    lookup_field = 'id'
    serializer_class = ReportSerializer


class CommentsView(APIView):
    def get(self, request, entity, id, page=1):
        comments = Comment.objects.filter(entity=entity, entity_id=id)
        comments = paginate(comments, page, 10)
        serializer =  CommentSerializer(comments, many=True)
        response = Response(serializer.data)
        # add pagination headers
        response['X-Has-Previous'] = comments.has_previous()
        response['X-Has-Next'] = comments.has_next()
        return response


class CriteriaListView(generics.ListAPIView):
    queryset = Criterion.objects.all()
    serializer_class = CriterionSerializer


class TopReviewsView(generics.ListAPIView):
    queryset = Review.objects.filter(created_at__gt=timezone.now() - datetime.timedelta(days=30 * 3))[:5]
    serializer_class = ReviewSerializer


class TopReportsView(generics.ListAPIView):
    queryset = Report.objects.filter(created_at__gt=timezone.now() - datetime.timedelta(days=30 * 3))[:5]
    serializer_class = ReportSerializer


class RatedHigherThanView(APIView):
    def get(self, request, school_id):
        school = School.objects.get(id=school_id)
        lower_rated_schools = School.objects.filter(rating__lt=school.rating).order_by('rank')
        serializer =  SchoolSerializer(lower_rated_schools, many=True)
        return Response(serializer.data)


class SuggestedMatchesView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        matches = []
        schools = School.objects.all()
        for school1 in schools:
            for school2 in schools.order_by('-id'):
                # school1 and school2 must not have been compared (rated) by the current user.
                if not Comparison.objects.filter(Q(school1=school1, school2=school2) | Q(school1=school2, school2=school1), comparer=request.user).exists():
                    # school1 and school2 must not be the same.
                    if not school1 == school2:
                        # Avoid duplicates i.e school1 vs school2 and school2 vs school1
                        match_a = {'school1_id': school1.id, 'school2_id': school2.id, 'school1': school1.name, 'school2': school2.name}
                        match_b = {'school1_id': school2.id, 'school2_id': school1.id, 'school1': school2.name, 'school2': school1.name}
                        if match_a not in matches and match_b not in matches:
                            matches.append(match_a)
        shuffle(matches)
        return Response(matches[:5])


class RatingView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        import json
        data = json.loads(request.POST.get('data'))

        school1_id = data['schools']['school1_id']
        school2_id = data['schools']['school2_id']
        choices = data['choices']

        if school1_id != school2_id:
            # school1 id must be less than school2 id
            # swap variables if not
            if school1_id > school2_id:
                school1_id, school2_id = school2_id, school1_id

            for choice in choices:
                comparison = Comparison.objects.update_or_create(
                    criterion=Criterion.objects.get(id=choice['criterion_id']),
                    school1=School.objects.get(id=school1_id),
                    school2=School.objects.get(id=school2_id),
                    choice=School.objects.get(id=choice['choice']),
                    comparer=request.user)
                comparison.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def get(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)